from fastapi import APIRouter, Request, Depends, HTTPException, Cookie
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from api.models import User, UserPet
from database.db_setup import get_db
from config import session_data, templates

router = APIRouter()

class NameRequest(BaseModel):
    custom_name: str

@router.get("/voice", response_class=HTMLResponse)
async def petslist(request: Request):
    return templates.TemplateResponse("voiceRecording.html", {"request": request})

@router.post("/set_custom_name")
async def set_custom_name(name_request: NameRequest, session_id: str = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    user_info = session_data[session_id]
    user_id = user_info.get('id')
    main_pet = user_info.get('main_pet_id')

    # 데이터베이스에서 user_pet 엔트리 찾기 또는 새로 생성
    user_pet = db.query(UserPet).filter_by(user_id=user_id, pet_id=main_pet).first()
    if not user_pet:
        user_pet = UserPet(user_id=user_id, pet_id=main_pet)

    user_pet.custom_name = name_request.custom_name

    db.add(user_pet)
    db.commit()

    return {"message": "Custom name set successfully"}
