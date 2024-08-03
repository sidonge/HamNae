from fastapi import APIRouter, Request, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse
from datetime import date
from services.attendance_service import record_attendance
from typing import Optional
from sqlalchemy.orm import Session
from database.db_setup import get_db
from config import templates, session_data

router = APIRouter()

@router.get("/mypet", response_class=HTMLResponse)
async def get_user(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    # 쿠키에서 세션 ID를 가져오고, 세션 데이터가 유효한지 확인
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # 세션 데이터에서 사용자 정보 가져오기
    user_info = session_data[session_id]
    main_pet = user_info['main_pet_id']
    
    # 템플릿을 렌더링하여 응답 반환
    return templates.TemplateResponse("mypet.html", {
        "request": request,
        "user": user_info,
        "main_pet" : main_pet
    })
