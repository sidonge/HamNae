from fastapi import APIRouter, HTTPException, Request, Cookie, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from api.models import User
from database.db_setup import get_db
from config import session_data
from typing import Optional

router = APIRouter()

@router.get("/mypet")
async def get_user(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_info = session_data[session_id]
    user_id = user_info.get('id')

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    main_pet = user.main_pet_id
    
    return JSONResponse(content={
        "user": user_info,
        "main_pet": main_pet
    })
