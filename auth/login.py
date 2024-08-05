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
        raise HTTPException(
            status_code=403, detail="Access forbidden: already logged in")
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
async def login(request: Request, id: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if user and verify_password(password, user.password):
        session_id = generate_session_id()
        session_data[session_id] = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "tel": user.tel,
            "xp": user.xp,
            "join_date": user.join_date,
            "level": user.level,
            "main_pet_id": user.main_pet_id
        }
        response = RedirectResponse(url="/garden.html", status_code=302)
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        return response
    else:
        return templates.TemplateResponse("login.html", {"request": request, "error": "아이디 또는 비밀번호가 잘못되었습니다."})

# Helper functions for SNS login
# def get_kakao_user_info(access_token: str):
#     headers = {"Authorization": f"Bearer {access_token}"}
#     response = requests.get("https://kapi.kakao.com/v2/user/me", headers=headers)
#     response.raise_for_status()
#     return response.json()


# def get_naver_user_info(access_token: str):
#     headers = {"Authorization": f"Bearer {access_token}"}
#     response = requests.get("https://openapi.naver.com/v1/nid/me", headers=headers)
#     response.raise_for_status()
#     return response.json()


# def get_google_user_info(id_token_str: str):
#     try:
#         idinfo = google_id_token.verify_oauth2_token(id_token_str, google_requests.Request())
#         return idinfo
#     except ValueError:
#         raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/social-login")
async def social_login(request: Request, db: Session = Depends(get_db)):
    # body = await request.json()
    
    # provider = body.get('provider')
    # access_token = body.get('access_token')
    # id = body.get('id')
    # name = body.get('name')
    # email = body.get('email')
    # tel = body.get('tel', '')  # 기본값을 빈 문자열로 설정

    # if not provider or not access_token or not id or not name or not email:
    #     raise HTTPException(status_code=400, detail="Missing required fields")
    
    # user = db.query(User).filter(User.id == id).first()
    
    # if user:
    #     user.name = name
    #     user.email = email
    #     user.tel = tel
    # else:
    #     user = User(
    #         id=id,
    #         name=name,
    #         email=email,
    #         tel=tel
    #     )
    #     db.add(user)
    
    # try:
    #     db.commit()
    # except Exception as e:
    #     db.rollback()
    #     raise HTTPException(status_code=500, detail="Database error")
    
    # session_id = generate_session_id()
    # session_data[session_id] = {
    #     "id": user.id,
    #     "name": user.name,
    #     "email": user.email,
    #     "tel": user.tel
    # }
    
    return {"message": "Login successful"}
# , "session_id": session_id