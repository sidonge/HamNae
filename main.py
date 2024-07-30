from fastapi import FastAPI, Request, HTTPException, Cookie, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from datetime import date
from services.attendance_service import record_attendance
from typing import Optional
from sqlalchemy.orm import Session
from database.db_setup import get_db
from config import templates, session_data

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Import and include routers for authentication
from auth import login, register
app.include_router(login.router, prefix="/auth")
app.include_router(register.router, prefix="/auth")

@app.get("/", response_class=JSONResponse)
def read_root():
    return {"message": "Welcome to FastAPI"}

@app.get("/mypage", response_class=HTMLResponse)
async def get_user(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_info = session_data[session_id]
    user_id = user_info['id']
    join_date = user_info['join_date']
    
    # Ensure join_date is a datetime.date object
    if isinstance(join_date, str):
        join_date = date.fromisoformat(join_date)  # Assuming date is in ISO format
    
    current_date = date.today()
    days_since_joined = (current_date - join_date).days + 1
    
    # Call the attendance recording service
    streak = record_attendance(user_id, db)
    
    return templates.TemplateResponse("mypage.html", {
        "request": request,
        "user": user_info,
        "days_since_joined": days_since_joined,
        "streak": streak
    })
