from fastapi import APIRouter, Request, HTTPException, Cookie, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from datetime import date
from services.attendance_service import record_attendance
from typing import Optional
from sqlalchemy.orm import Session
from database.db_setup import get_db
from config import templates, session_data

from api.models import User
from pydantic import EmailStr
from passlib.context import CryptContext # 비밀번호 해싱 import

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # 비밀번호 해싱 설정


@router.get("/mypage", response_class=HTMLResponse)
async def get_user(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    # 쿠키에서 세션 ID를 가져오고, 세션 데이터가 유효한지 확인
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # 세션 데이터에서 사용자 정보 가져오기
    user_info = session_data[session_id]
    user_id = user_info['id']
    join_date = user_info['join_date']
    
    # join_date가 문자열일 경우 datetime.date 객체로 변환
    if isinstance(join_date, str):
        join_date = date.fromisoformat(join_date)  # join_date가 ISO 포맷 문자열이라고 가정
    
    current_date = date.today()  # 현재 날짜
    days_since_joined = (current_date - join_date).days + 1  # 가입한 지 며칠 되었는지 계산
    
    # 출석 기록을 위한 서비스 호출
    streak = record_attendance(user_id, db)
    
    # 템플릿을 렌더링하여 응답 반환
    return templates.TemplateResponse("mypage.html", {
        "request": request,
        "user": user_info,
        "days_since_joined": days_since_joined,
        "streak": streak
    })



#추가사항 정보 수정
@router.get("/mypage/edit", response_class=HTMLResponse)  # GET 요청 처리 라우트
async def edit_user_form(request: Request, session_id: str = Cookie(None), db: Session = Depends(get_db)):
    # 세션 유효성 검사
    if session_id is None or session_id not in session_data: 
        raise HTTPException(status_code=401, detail="Invalid session")

    user_info = session_data[session_id]
    user_id = user_info['id']

    db_user = db.query(User).filter_by(id=user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return templates.TemplateResponse("edit_profile.html", {"request": request, "user": db_user})


@router.post("/mypage/edit")  # POST 요청 처리 라우트
async def edit_user(
    name: str = Form(...),
    email: EmailStr = Form(...),
    tel: str = Form(...),
    password: str = Form(None), 
    session_id: str = Cookie(None),
    db: Session = Depends(get_db)
):
    
    if session_id is None or session_id not in session_data: 
        raise HTTPException(status_code=401, detail="세션이 유효하지 않습니다.")

    user_info = session_data[session_id]
    user_id = user_info['id']  # 세션에서 사용자 ID 가져오기

    try:  # try 블록 시작
        db_user = db.query(User).filter_by(id=user_id).first() 
        if not db_user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        #이메일, 전화번호 중복 확인 로직
        db_user.email = email
        db_user.tel = tel

        #입력한 값으로 업데이트
        if name:
            db_user.name = name
        if email:
            db_user.email = email
        if tel:
            db_user.tel = tel

        # 비밀번호 변경 시에만 해싱 및 업데이트
        if password:  
            hashed_password = pwd_context.hash(password)
            db_user.password = hashed_password

        db.commit()

        # 세션 데이터 업데이트 (예시)
        session_data[session_id]['name'] = name
        session_data[session_id]['email'] = email
        session_data[session_id]['tel'] = tel

        return RedirectResponse(url="/mypage", status_code=302)
    except Exception as e:
        db.rollback()  # 예외 발생 시 롤백
        print(f"Error during profile update: {e}")
        raise HTTPException(status_code=500, detail="프로필 업데이트 중 오류가 발생했습니다.") 