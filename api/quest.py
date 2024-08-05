from fastapi import APIRouter, HTTPException, Depends, Request, Cookie, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, join
from typing import Optional
from fastapi.templating import Jinja2Templates
from api.models import Quest, UserQuest, User
from database import SessionLocal

router = APIRouter()

# 템플릿 디렉토리 설정
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/update-stamp")
async def update_stamp(mission: str, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None:
        raise HTTPException(status_code=401, detail="No session ID provided")

    user = db.query(User).filter(User.id == session_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid session")

    user_id = user.id

    # 미션 ID 매핑
    mission_map = {
        'talk_cleared_stamp': 1,
        'wash_cleared_stamp': 2,
        'pills_cleared_stamp': 3,
        'walk_cleared_stamp': 4,
        'bed_cleared_stamp': 5,
        'water_cleared_stamp': 6,
        'cooking_cleared_stamp': 7,
        'clean_cleared_stamp': 8
    }

    quest_id = mission_map.get(mission)
    if quest_id is None:
        raise HTTPException(status_code=400, detail="Invalid mission type")

    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == quest_id).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
        return {"message": f"{mission} completed"}
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

@router.get("/get_user_quests", response_class=HTMLResponse)
async def get_user_quests(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None:
        raise HTTPException(status_code=401, detail="No session ID provided")

    # 세션 데이터에서 사용자 정보 가져오기
    user = db.query(User).filter(User.id == session_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid session")

    user_id = user.id

    stmt = (
        select(UserQuest, Quest)
        .select_from(join(UserQuest, Quest, UserQuest.quest_id == Quest.id))
        .where(UserQuest.user_id == user_id)
    )
    result = db.execute(stmt).fetchall()

    if not result:
        raise HTTPException(status_code=404, detail="No quests found for user")

    completed_quests = [user_quest for user_quest, _ in result if user_quest.completed]
    total_quests = len(result)
    completed_count = len(completed_quests)
    remaining_count = total_quests - completed_count

    quests = []
    for user_quest, quest in result:
        quests.append({
            "user_id": user_quest.user_id,
            "quest_id": user_quest.quest_id,
            "quest_name": quest.name,
            "quest_points": quest.points,
            "completed": user_quest.completed
        })

    return templates.TemplateResponse("quest_list.html", {
        "request": request,
        "user": user,  # 사용자 정보 전달
        "quests": quests,
        "completed_count": completed_count,
        "remaining_count": remaining_count,
        "all_completed": completed_count == total_quests
    })

@router.post("/claim_xp", response_class=HTMLResponse)
async def claim_xp(session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None:
        raise HTTPException(status_code=401, detail="No session ID provided")
    
    user = db.query(User).filter(User.id == session_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_id = user.id
    
    stmt = (
        select(UserQuest)
        .where(UserQuest.user_id == user_id)
        .where(UserQuest.completed == True)
        .where(UserQuest.claimed_xp == False)  # Claim XP only if not already claimed
    )
    completed_quests = db.execute(stmt).fetchall()
    
    if not completed_quests:
        raise HTTPException(status_code=400, detail="No completed quests to claim XP from")
    
    xp_to_claim = 100 * len(completed_quests)
    
    user.xp += xp_to_claim
    db.commit()
    
    for user_quest in completed_quests:
        user_quest.claimed_xp = True
    db.commit()
    
    return {"message": "XP claimed successfully", "xp": user.xp}

@router.post("/complete_talk_quest/")
async def complete_talk_quest(user_id: str, db: Session = Depends(get_db)):
    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == 1).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

    return {"message": "Talk quest completed"}

@router.post("/complete_wash_quest/")
async def complete_wash_quest(user_id: str, db: Session = Depends(get_db)):
    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == 2).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

    return {"message": "Wash quest completed"}

@router.post("/complete_pills_quest/")
async def complete_pills_quest(user_id: str, db: Session = Depends(get_db)):
    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == 3).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

    return {"message": "Pills quest completed"}

@router.post("/complete_walk_quest/")
async def complete_walk_quest(user_id: str, db: Session = Depends(get_db)):
    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == 4).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

    return {"message": "Walk quest completed"}

@router.post("/complete_bed_quest/")
async def complete_bed_quest(user_id: str, db: Session = Depends(get_db)):
    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == 5).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

    return {"message": "Bed quest completed"}

@router.post("/complete_photo_quest/")
async def complete_photo_quest(user_id: str, quest_id: int, db: Session = Depends(get_db)):
    user_quest = db.query(UserQuest).filter(UserQuest.user_id == user_id, UserQuest.quest_id == quest_id).first()
    if user_quest:
        user_quest.completed = True
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="UserQuest entry not found")

    return {"message": "Photo quest completed"}

@router.post("/login")
async def login(username: str = Form(...), password: str = Form(...), response: RedirectResponse = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == username, User.password == password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 세션에 사용자 정보 저장
    session_id = str(user.id)  # 세션 ID를 사용자 ID로 설정
    response.set_cookie(key="session_id", value=session_id, httponly=True)
    
    return response
