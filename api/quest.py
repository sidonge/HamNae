from fastapi import APIRouter, HTTPException, Depends, Request, Cookie
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, join
from api.models import Quest, UserQuest
from database.db_setup import get_db
from typing import Optional
from fastapi.templating import Jinja2Templates
from config import session_data

router = APIRouter()

# 템플릿 디렉토리 설정
templates = Jinja2Templates(directory="templates")

@router.get("/get_user_quests", response_class=HTMLResponse)
async def get_user_quests(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    # 쿠키에서 세션 ID를 가져오고, 세션 데이터가 유효한지 확인
    if session_id is None:
        raise HTTPException(status_code=401, detail="No session ID provided")
    if session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # 세션 데이터에서 사용자 정보 가져오기
    user_info = session_data[session_id]
    user_id = user_info.get('id')
    if user_id is None:
        raise HTTPException(status_code=401, detail="User ID not found in session")
    
    # UserQuest와 Quest 테이블을 조인하여 사용자의 퀘스트 정보를 가져오기
    stmt = (
        select(UserQuest, Quest)
        .select_from(join(UserQuest, Quest, UserQuest.quest_id == Quest.id))
        .where(UserQuest.user_id == user_id)
    )
    result = db.execute(stmt).fetchall()
    
    if not result:
        raise HTTPException(status_code=404, detail="No quests found for user")
    
    # 결과를 사전으로 변환
    quests = []
    for user_quest, quest in result:
        quests.append({
            "user_id": user_quest.user_id,
            "quest_id": user_quest.quest_id,
            "quest_name": quest.name,
            "quest_points": quest.points,
            "completed": user_quest.completed  # completed 컬럼 추가
        })
    
    # quest_list.html 템플릿 렌더링
    return templates.TemplateResponse("quest_list.html", {"request": request, "quests": quests})
