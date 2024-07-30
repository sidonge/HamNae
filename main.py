from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi import FastAPI, Request, HTTPException, Cookie, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from datetime import date
from services.attendance_service import record_attendance
from typing import Optional
from sqlalchemy.orm import Session
from database.db_setup import get_db
from config import templates, session_data
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files 설정
app.mount("/static", StaticFiles(directory="static"), name="static")

# 템플릿 설정
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
# 업로드 디렉토리 설정
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 클리어 상태를 저장할 파일
STATUS_FILE = "status.json"

# 미션과 파일 이름 매핑
STAMP_MAP = {
    'water': 'water_cleared_stamp.png',
    'clean': 'broomstick_cleared_stamp.png',
    'cooking': 'pot_cleared_stamp.png',
    'wash': 'bath_cleared_stamp.png',
    'bed': 'meditation_cleared_stamp.png'
}

def save_status(mission: str):
    try:
        if not os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "w") as f:
                f.write("{}")
        
        with open(STATUS_FILE, "r") as f:
            status = json.load(f)
        
        status[mission] = "true"
        
        with open(STATUS_FILE, "w") as f:
            json.dump(status, f)
    except Exception as e:
        print(f"Error saving status: {e}")

def get_status():
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "r") as f:
                return json.load(f)
        else:
            return {}
    except Exception as e:
        print(f"Error reading status: {e}")
        return {}

@app.get("/", response_class=HTMLResponse)
async def main(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/petslist")
async def petslist(request: Request):
    return templates.TemplateResponse("petslist.html", {"request": request})

@app.get("/quest", response_class=HTMLResponse)
async def quest(request: Request):
    return templates.TemplateResponse("quest.html", {"request": request})

@app.get("/quest_status")
async def quest_status():
    status = get_status()
    return JSONResponse(content={"status": status}, status_code=200)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        mission = file.filename.split('_')[0].lower()
        new_filename = STAMP_MAP.get(mission, file.filename)
        file_location = os.path.join(UPLOAD_DIR, new_filename)
        with open(file_location, "wb") as f:
            shutil.copyfileobj(file.file, f)
        save_status(mission)
        return JSONResponse(content={"success": True, "file_path": file_location}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@app.post("/update_quest_stamps")
async def update_quest_stamps(request: Request):
    try:
        data = await request.json()
        mission = data.get("mission")
        if mission:
            save_status(mission)
            return JSONResponse(content={"success": True}, status_code=200)
        else:
            return JSONResponse(content={"success": False, "error": "Mission not provided"}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@app.get("/models/{model_name}")
async def get_model(model_name: str):
    file_path = os.path.join("templates", "models", model_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"success": False, "error": "File not found"}, status_code=404)

@app.get("/character", response_class=HTMLResponse)
async def read_character(request: Request):
    return templates.TemplateResponse("character.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
