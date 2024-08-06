# auth/login.py

from fastapi import APIRouter, Form, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User
from config import templates, generate_session_id, session_data
from passlib.context import CryptContext
from auth.dependencies import get_current_user
from typing import Optional

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request, user: dict = Depends(get_current_user)):
    if user:
        raise HTTPException(status_code=403, detail="Access forbidden: already logged in")
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
async def login(request: Request, id: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    print("/login - post 도착")
    user = db.query(User).filter(User.id == id).first()
    if user and verify_password(password, user.password):
        session_id = generate_session_id()
        print("세션아이디 : "+ session_id)
        session_data[session_id] = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "tel": user.tel,
            "xp": user.xp,
            "join_date": user.join_date,
            "level" : user.level,
            "main_pet_id" : user.main_pet_id
        }
        response = RedirectResponse(url="/main", status_code=302)
        response = RedirectResponse(url="/main", status_code=302)
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        return response
    else:
        return templates.TemplateResponse("login.html", {"request": request, "error": "아이디 또는 비밀번호가 잘못되었습니다."})




@router.post("/social-login")
async def social_login(request: Request, db: Session = Depends(get_db)):
    
    
    return {"message": "Login successful"}
# , "session_id": session_id