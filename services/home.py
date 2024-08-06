from fastapi import APIRouter, Request, File, UploadFile, Depends, HTTPException, Cookie
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from config import templates, session_data
import os
import json
import shutil
from sqlalchemy.orm import Session
from pydantic import BaseModel
from api.models import User, UserPet
from database.db_setup import get_db

router = APIRouter(tags=["홈"])

# voice


class NameRequest(BaseModel):
    custom_name: str


@router.get("/voice", response_class=HTMLResponse)
async def petslist(request: Request):
    return templates.TemplateResponse("voiceRecording.html", {"request": request})


@router.post("/set_custom_name")
async def set_custom_name(name_request: NameRequest, session_id: str = Cookie(None), db: Session = Depends(get_db)):
    if session_id is None or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    print("custom_name :" + name_request.custom_name)  # 수정된 부분

    user_info = session_data[session_id]
    user_id = user_info.get('id')
    main_pet = user_info.get('main_pet_id')

    # 데이터베이스에서 user_pet 엔트리 찾기 또는 새로 생성
    user_pet = db.query(UserPet).filter_by(
        user_id=user_id, pet_id=main_pet).first()
    if not user_pet:
        user_pet = UserPet(user_id=user_id, pet_id=main_pet)

    user_pet.custom_name = name_request.custom_name

    db.add(user_pet)
    db.commit()

    return {"message": "Custom name set successfully"}


# stamp
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
STATUS_FILE = "status.json"

STAMP_MAP = {
    'water': 'water_cleared_stamp.png',
    'clean': 'clean_cleared_stamp.png',
    'cooking': 'cooking_cleared_stamp.png',
    'wash': 'wash_cleared_stamp.png',
    'bed': 'bed_cleared_stamp.png',
    'pills': 'pills_cleared_stamp',
    'talk': 'talk_cleared_stamp',
}

# 상태 저장 함수


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

# 상태 가져오기 함수


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


@router.get("/quest_status")
async def quest_status():
    status = get_status()
    return JSONResponse(content={"status": status}, status_code=200)


@router.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


@router.post("/upload")
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
