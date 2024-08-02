# auth/register.py

from fastapi import APIRouter, Form, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User, UserPet, Pet, UserQuest, Quest
from passlib.context import CryptContext
from datetime import datetime
from config import templates
from auth.dependencies import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    id: str
    name: str
    password: str
    email: EmailStr
    tel: str

@router.get("/register", response_class=HTMLResponse)
def register_form(request: Request, user: dict = Depends(get_current_user)):
    if user:
        raise HTTPException(status_code=403, detail="Access forbidden: already logged in")
    return templates.TemplateResponse("signup.html", {"request": request})

@router.post("/register")
def register_user(id: str = Form(...), name: str = Form(...),
                   password: str = Form(...), email: str = Form(...), tel: str = Form(...),
                   db: Session = Depends(get_db)):
    # 사용자 존재 확인
    db_user = db.query(User).filter(User.id == id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User ID already exists")
    
    db_user = db.query(User).filter(User.name == name).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Name already exists")
    
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    # 비밀번호 해싱
    hashed_password = pwd_context.hash(password)
    join_date = datetime.now().date()

    # 새로운 사용자 생성
    new_user = User(
        id=id,
        name=name,
        password=hashed_password,
        email=email,
        tel=tel,
        xp=200,
        coin=300,  # 기본 코인 설정
        join_date=join_date,
        level=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 기본 펫 데이터 삽입
    default_pets = ['hamster', 'rabbit']  # 기본 펫 ID 목록
    for pet_id in default_pets:
        user_pet = UserPet(user_id=id, pet_id=pet_id)
        db.add(user_pet)
    
    db.commit()

    # 기본 퀘스트 데이터 삽입
    quests = db.query(Quest).all()  # 모든 퀘스트 가져오기
    for quest in quests:
        user_quest = UserQuest(user_id=id, quest_id=quest.id)  # progress 없이 생성
        db.add(user_quest)
    
    db.commit()

    return RedirectResponse(url="/auth/login", status_code=302)
