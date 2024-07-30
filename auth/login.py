from fastapi import APIRouter, Form, Request, HTTPException, Depends, Cookie, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User
from config import templates, generate_session_id, session_data
from passlib.context import CryptContext
from services.attendance_service import record_attendance

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
async def login(request: Request, id: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if user and verify_password(password, user.password):
        session_id = generate_session_id()
        session_data[session_id] = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "tel": user.tel,
            "xp": user.xp,
            "join_date": user.join_date
        }
        response = Response(content="Login successful", status_code=200)
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        return response
    else:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials"})
