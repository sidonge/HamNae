# auth/register.py

from fastapi import APIRouter, Form, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User
from passlib.context import CryptContext
from datetime import datetime
from config import templates
from auth.dependencies import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic 모델을 사용하여 사용자 생성 요청을 검증
class UserCreate(BaseModel):
    id: str
    name: str
    password: str
    email: EmailStr
    tel: str

# 회원가입 폼을 보여주는 엔드포인트
@router.get("/register", response_class=HTMLResponse)
def register_form(request: Request, user: dict = Depends(get_current_user)):
    if user:
        raise HTTPException(status_code=403, detail="Access forbidden: already logged in")
    return templates.TemplateResponse("signup.html", {"request": request})

# 회원가입 처리 엔드포인트
@router.post("/register")
def register_user(id: str = Form(...), name: str = Form(...),
                   password: str = Form(...), email: str = Form(...), tel: str = Form(...),
                   db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User ID already exists")
    
    db_user = db.query(User).filter(User.name == name).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Name already exists")
    
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    # 비밀번호 해싱 및 가입 날짜 설정
    hashed_password = pwd_context.hash(password)
    join_date = datetime.now().date()

    # 새로운 사용자 객체 생성 및 데이터베이스에 추가
    new_user = User(
        id=id,
        name=name,
        password=hashed_password,
        email=email,
        tel=tel,
        xp=200,
        join_date=join_date
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # 회원가입 성공 후 로그인 페이지로 리다이렉트
    return RedirectResponse(url="/login", status_code=302)
