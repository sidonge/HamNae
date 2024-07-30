# auth/login.py

from fastapi import APIRouter, Form, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User
from config import templates, generate_session_id, session_data
from passlib.context import CryptContext
from auth.dependencies import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호를 검증하는 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 로그인 폼을 보여주는 엔드포인트
@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request, user: dict = Depends(get_current_user)):
    if user:
        raise HTTPException(status_code=403, detail="Access forbidden: already logged in")
    return templates.TemplateResponse("login.html", {"request": request})

# 로그인 처리 엔드포인트
@router.post("/login")
async def login(request: Request, id: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    # 사용자 존재 여부 및 비밀번호 검증
    if user and verify_password(password, user.password):
        session_id = generate_session_id()
        session_data[session_id] = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "tel": user.tel,
            "xp": user.xp,
            "join_date": user.join_date
        }
        # 로그인 성공 시 리다이렉트 및 쿠키 설정
        response = RedirectResponse(url="/garden.html", status_code=302)
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        return response
    else:  # 로그인 실패 시 에러 메시지와 함께 로그인 폼 다시 렌더링
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials"})
