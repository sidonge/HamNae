# app/auth/register.py

from fastapi import APIRouter, Form, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    id: str
    name: str
    password: str
    email: EmailStr
    tel: str

@router.post("/register")
def register_user(id: str = Form(...), name: str = Form(...),
                   password: str = Form(...), email: str = Form(...), tel: str = Form(...),
                   db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User ID already exists")
    
    db_user = db.query(User).filter(User.name == name).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Name already exists")
    
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = pwd_context.hash(password)
    join_date = datetime.now().date()

    new_user = User(
        id=id,
        name=name,
        password=hashed_password,
        email=email,
        tel=tel,
        xp=200,
        join_date=join_date
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user": new_user.id}
