from fastapi import APIRouter, HTTPException, Depends, Request, Cookie
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, join
from api.models import Quest, UserQuest, User
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
    
    # 완료된 퀘스트 수와 전체 퀘스트 수 계산
    completed_quests = [user_quest for user_quest, _ in result if user_quest.completed]
    total_quests = len(result)
    completed_count = len(completed_quests)
    remaining_count = total_quests - completed_count
    
    # 결과를 사전으로 변환
    quests = []
    for user_quest, quest in result:
        quests.append({
            "user_id": user_quest.user_id,
            "quest_id": user_quest.quest_id,
            "quest_name": quest.name,
            "quest_points": quest.points,
            "completed": user_quest.completed
        })
    
    # quest_list.html 템플릿 렌더링
    return templates.TemplateResponse("quest_list.html", {
        "request": request, 
        "quests": quests,
        "completed_count": completed_count,
        "remaining_count": remaining_count,
        "all_completed": completed_count == total_quests
    })

@router.post("/claim_xp", response_class=HTMLResponse)
async def claim_xp(session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
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
    
    # UserQuest와 Quest 테이블을 조인하여 사용자의 완료된 퀘스트 정보를 가져오기
    stmt = (
        select(UserQuest)
        .where(UserQuest.user_id == user_id)
        .where(UserQuest.completed == True)
    )
    completed_quests = db.execute(stmt).fetchall()
    
    if not completed_quests:
        raise HTTPException(status_code=400, detail="No completed quests to claim XP from")
    
    # XP 계산 (예: 완료된 퀘스트마다 100 XP 제공)
    xp_to_claim = 100 * len(completed_quests)
    
    # 사용자의 XP를 업데이트
    # 예: 사용자 데이터베이스 테이블에 `xp` 필드가 있다고 가정
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.xp += xp_to_claim
    db.commit()
    
    # XP 수령을 표시 (예: `claimed_xp` 필드 업데이트)
    for user_quest in completed_quests:
        user_quest.claimed_xp = True  # 예: `UserQuest` 모델에 `claimed_xp` 필드가 있다고 가정
    db.commit()
    
    return {"message": "XP claimed successfully", "xp": user.xp}

@router.post("/complete_quest/")
def complete_quest(quest_id: int, db: Session = Depends(get_db)):
    # 퀘스트를 찾습니다
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    # 퀘스트가 이미 완료되었는지 확인합니다
    if quest.completed:
        raise HTTPException(status_code=400, detail="Quest already completed")
    
    # 퀘스트 완료 상태를 업데이트합니다
    quest.completed = True
    db.commit()

    # 사용자의 XP를 업데이트 합니다 (퀘스트의 사용자 ID를 통해)
    user_quest = db.query(UserQuest).filter(UserQuest.quest_id == quest_id).first()
    if not user_quest:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")
    
    user = db.query(User).filter(User.id == user_quest.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.xp += 150
    db.commit()

    return {"message": "Quest completed and XP added"}
