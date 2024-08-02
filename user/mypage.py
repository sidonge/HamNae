from fastapi import APIRouter, Request, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse
from datetime import date
from services.attendance_service import record_attendance
from typing import Optional
from sqlalchemy.orm import Session
from database.db_setup import get_db
from config import templates, session_data

router = APIRouter()

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
