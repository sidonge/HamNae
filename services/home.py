from fastapi import APIRouter, Request, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from config import templates
import os, json, shutil

router = APIRouter(tags=["홈"])

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
    
@router.get("/models/{model_name}")
async def get_model(model_name: str):
    file_path = os.path.join("templates", "models", model_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"success": False, "error": "File not found"}, status_code=404)