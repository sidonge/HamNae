from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from config import templates
import os, json

router = APIRouter()

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

@router.get("/quest", response_class=HTMLResponse)
async def quest(request: Request):
    return templates.TemplateResponse("quest.html", {"request": request})

@router.get("/quest_status")
async def quest_status():
    status = get_status()
    return JSONResponse(content={"status": status}, status_code=200)

@router.post("/update_quest_stamps")
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
