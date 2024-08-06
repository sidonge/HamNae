from fastapi import APIRouter, Request, File, UploadFile, Depends, HTTPException, Cookie, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, PlainTextResponse
from config import templates, session_data
import os
import json
import shutil
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from api.models import User, UserPet, Quest, UserQuest
from database.db_setup import get_db

router = APIRouter(tags=["홈"])


@router.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@router.post("/complete_mission")
async def complete_mission(
    request: Request,
    mission: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 세션 ID를 쿠키에서 가져옴
    session_id = request.cookies.get("session_id")
    
    if not session_id or session_id not in session_data:
        return PlainTextResponse("Invalid session", status_code=401)

    # 세션 데이터에서 사용자 정보를 가져옴
    user_info = session_data[session_id]
    user_id = user_info["id"]

    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return PlainTextResponse("User not found", status_code=404)
    
    # 미션과 관련된 Quest 레코드 찾기
    quest = db.query(Quest).filter_by(name=mission).first()
    if not quest:
        return PlainTextResponse("Mission not found", status_code=404)

    # 사용자 퀘스트 레코드 찾기
    user_quest = db.query(UserQuest).filter_by(user_id=user_id, quest_id=quest.id).first()
    
    if not user_quest:
        return PlainTextResponse("User quest not found", status_code=404)
    
    # 미션 완료 처리
    user_quest.completed = True
    db.commit()  # 변경 사항을 데이터베이스에 커밋

    # 파일을 저장하지 않고 단순히 확인만 하는 로직
    print(file)
    print(mission)
    
    return PlainTextResponse("Mission completed successfully", status_code=200)
# # MissionRequest 모델 정의
# class MissionRequest(BaseModel):
#     mission: str

# @router.post("/complete_mission")
# async def complete_mission(
#     mission: str = Form(...),
#     file: Optional[UploadFile] = File(None),  # 파일은 선택적이며, None일 수 있습니다.
#     session_id: Optional[str] = Cookie(None),
#     db: Session = Depends(get_db)
# ):
#     print("/complete_mission")
    
#     # 세션 확인 및 사용자 정보 조회
#     if session_id is None:
#         raise HTTPException(status_code=401, detail="No session ID provided")
#     if session_id not in session_data:
#         raise HTTPException(status_code=401, detail="Invalid session")
    
#     user_info = session_data[session_id]
#     user_id = user_info.get('id')
#     if user_id is None:
#         raise HTTPException(status_code=401, detail="User ID not found in session")
    
#     # 미션 이름에 따라 미션 ID를 찾습니다
#     quest = db.query(Quest).filter(Quest.name == mission).first()
#     if quest is None:
#         raise HTTPException(status_code=400, detail="Invalid mission name")
    
#     # UserQuest 테이블에서 해당 미션이 완료되었는지 확인 후 업데이트
#     user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == quest.id).first()
    
#     if user_quest is None:
#         # 미션이 존재하지 않는 경우 새로 생성
#         user_quest = UserQuest(user_id=user_id, quest_id=quest.id, completed=True)
#         db.add(user_quest)
#     else:
#         # 기존 미션이 존재하는 경우 업데이트
#         user_quest.completed = True
    
#     db.commit()
    
#     # 파일이 존재할 경우 저장 처리 (옵션)
#     if file:
#         file_location = f"uploads/{file.filename}"
#         with open(file_location, "wb") as f:
#             shutil.copyfileobj(file.file, f)

#     return {"success": True}


# voice


class NameRequest(BaseModel):
    custom_name: str


@router.get("/voice", response_class=HTMLResponse)
async def petslist(request: Request):
    return templates.TemplateResponse("voiceRecording.html", {"request": request})


@router.post("/set_custom_name")
async def set_custom_name(name_request: NameRequest, session_id: str = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    print("custom_name :" + name_request.custom_name)  # 수정된 부분

    user_info = session_data[session_id]
    user_id = user_info.get('id')
    main_pet = user_info.get('main_pet_id')

    # 데이터베이스에서 user_pet 엔트리 찾기 또는 새로 생성
    user_pet = db.query(UserPet).filter_by(
        user_id=user_id, pet_id=main_pet).first()
    if not user_pet:
        user_pet = UserPet(user_id=user_id, pet_id=main_pet)

    user_pet.custom_name = name_request.custom_name

    db.add(user_pet)
    db.commit()

    return {"message": "Custom name set successfully"}


