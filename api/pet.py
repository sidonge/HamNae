from fastapi import APIRouter, HTTPException, Depends, Request, Cookie
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from database.db_setup import get_db
from api.models import Pet, UserPet, User
from config import templates, session_data

router = APIRouter()

@router.get("/pets", response_class=HTMLResponse)
async def get_pets(request: Request, db: Session = Depends(get_db)):
    print("/pets")
    session_id = request.cookies.get("session_id")
    print("session_id : "+ session_id)
    user_info = session_data[session_id]
    user_id = user_info.get('id')
    if not session_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    print("user_id : "+ user_id)
    # 세션 ID를 기반으로 사용자 조회
    user_query = select(User).where(User.id == user_id)
    result = db.execute(user_query)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 유저가 보유한 펫 ID를 가져오기
    user_pets_query = select(UserPet).where(UserPet.user_id == user.id)
    result = db.execute(user_pets_query)
    user_pet_ids = [user_pet.pet_id for user_pet in result.scalars().all()]

    if not user_pet_ids:
        raise HTTPException(status_code=404, detail="No pets found for the user")

    # 보유한 펫 정보 가져오기
    pets_query = select(Pet).where(Pet.pet_id.in_(user_pet_ids))
    result = db.execute(pets_query)
    pet_data = result.scalars().all()

    return templates.TemplateResponse("pets.html", {"request": request, "pets": pet_data})