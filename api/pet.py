from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import Pet, UserPet, User
from config import session_data

router = APIRouter()

@router.get("/pets")
async def get_pets(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_info = session_data[session_id]
    user_id = user_info.get('id')
    
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_pets = db.query(UserPet).filter_by(user_id=user.id).all()
    user_pet_ids = [user_pet.pet_id for user_pet in user_pets]

    if not user_pet_ids:
        raise HTTPException(status_code=404, detail="No pets found for the user")

    pets = db.query(Pet).filter(Pet.pet_id.in_(user_pet_ids)).all()

    pets_list = [{"name": pet.name, "description": pet.description, "pet_id": pet.pet_id, "model_path": pet.model_path} for pet in pets]
    
    return JSONResponse(content={"pets": pets_list})