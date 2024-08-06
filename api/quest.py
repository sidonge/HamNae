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
    if session_id is None:
        raise HTTPException(status_code=401, detail="No session ID provided")
    if session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_info = session_data[session_id]
    user_id = user_info.get('id')
    if user_id is None:
        raise HTTPException(status_code=401, detail="User ID not found in session")
    
    stmt = (
        select(UserQuest, Quest)
        .select_from(join(UserQuest, Quest, UserQuest.quest_id == Quest.id))
        .where(UserQuest.user_id == user_id)
    )
    result = db.execute(stmt).fetchall()
    
    if not result:
        raise HTTPException(status_code=404, detail="No quests found for user")
    
    quests = []
    for user_quest, quest in result:
        quests.append({
            "user_id": user_quest.user_id,
            "quest_id": user_quest.quest_id,
            "quest_name": quest.name,
            "quest_points": quest.points,
            "completed": user_quest.completed
        })
    
    return templates.TemplateResponse("quest_list.html", {"request": request, "quests": quests})
