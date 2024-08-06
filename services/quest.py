from fastapi import APIRouter, HTTPException, Depends, Request, Cookie
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from config import templates
from typing import List
from api.models import User, UserQuest
from database.db_setup import get_db
import os
import json
from config import templates, session_data
from typing import Optional

# APIRouter 객체 생성
router = APIRouter(tags=["퀘스트"])

@router.get("/quest", response_class=HTMLResponse)
async def quest(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    # 쿠키에서 세션 ID를 가져오고, 세션 데이터가 유효한지 확인
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    # 세션 데이터에서 사용자 정보 가져오기
    user_info = session_data[session_id]
    print(user_info)
    user_id = user_info['id']
    user_name = user_info['name']

    # 세션 ID를 기반으로 사용자 조회
    user_query = select(User).where(User.id == user_id)
    result = db.execute(user_query)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 템플릿에 전달할 데이터에 user_info 추가
    context = {
        "request": request,
        "name": user_name,
        "user_info": user_info  # 이 부분을 추가
    }
    
    return templates.TemplateResponse("quest.html", context)

@router.get("/user_quests_status", response_model=List[dict])
async def get_user_quests_status(session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_info = session_data[session_id]
    user_id = user_info['id']
    
    # 유저 퀘스트 상태 가져오기
    query = select(UserQuest).where(UserQuest.user_id == user_id)
    result = db.execute(query)
    user_quests = result.scalars().all()

    quest_status = []
    for user_quest in user_quests:
        quest_status.append({
            "id": user_quest.quest.name,  # 'name' 속성을 사용하여 퀘스트 이름 가져오기
            "completed": user_quest.completed
        })

    return quest_status

#### 지아꺼

# UPLOAD_DIR = "./uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
# STATUS_FILE = "status.json"

# STAMP_MAP = {
#     'water': 'water_cleared_stamp.png',
#     'clean': 'clean_cleared_stamp.png',
#     'cooking': 'cooking_cleared_stamp.png',
#     'wash': 'wash_cleared_stamp.png',
#     'bed': 'bed_cleared_stamp.png',
#     'pills': 'pills_cleared_stamp',
#     'talk': 'talk_cleared_stamp',
# }

# # 상태 저장 함수
# def save_status(mission: str, completed: bool):
#     try:
#         if not os.path.exists(STATUS_FILE):
#             with open(STATUS_FILE, "w") as f:
#                 json.dump({"missions": {}}, f)
                
#         with open(STATUS_FILE, "r") as f:
#             data = json.load(f)

#         if "missions" not in data:
#             data["missions"] = {}
            
#         data["missions"][mission] = {
#             "completed": completed,
#             "timestamp": "2024-08-06T00:00:00"  # 현재 날짜 및 시간으로 변경 가능
#         }

#         with open(STATUS_FILE, "w") as f:
#             json.dump(data, f, indent=4)
#     except Exception as e:
#         print(f"Error saving status: {e}")

# # 상태 저장 함수
# def save_status(mission: str):
#     try:
#         # 상태 파일이 없으면 빈 JSON 객체를 생성
#         if not os.path.exists(STATUS_FILE):
#             with open(STATUS_FILE, "w") as f:
#                 f.write("{}")

#         # 상태 파일 읽기
#         with open(STATUS_FILE, "r") as f:
#             status = json.load(f)

#         # 상태 업데이트
#         status[mission] = "true"

#         # 상태 파일에 다시 쓰기
#         with open(STATUS_FILE, "w") as f:
#             json.dump(status, f)
#     except Exception as e:
#         print(f"Error saving status: {e}")

# # 상태 가져오기 함수
# def get_status():
#     try:
#         if os.path.exists(STATUS_FILE):
#             with open(STATUS_FILE, "r") as f:
#                 return json.load(f)
#         else:
#             return {"missions": {}}
#     except Exception as e:
#         print(f"Error reading status: {e}")
#         return {"missions": {}}



# @router.get("/quest_status")
# async def quest_status():
#     # 현재 상태를 JSON으로 반환
#     status = get_status()
#     return JSONResponse(content={"status": status}, status_code=200)

# @router.post("/update_quest_stamps")
# async def update_quest_stamps(request: Request):
#     try:
#         data = await request.json()
#         mission = data.get("mission")
#         completed = data.get("completed", False)
#         if mission:
#             save_status(mission, completed)
#             return JSONResponse(content={"success": True}, status_code=200)
#         else:
#             return JSONResponse(content={"success": False, "error": "Mission not provided"}, status_code=400)
#     except Exception as e:
#         return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)