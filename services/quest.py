from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from config import templates
import os
import json

# APIRouter 객체 생성
router = APIRouter(tags=["퀘스트"])

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
def save_status(mission: str, completed: bool):
    try:
        if not os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "w") as f:
                json.dump({"missions": {}}, f)
                
        with open(STATUS_FILE, "r") as f:
            data = json.load(f)

        if "missions" not in data:
            data["missions"] = {}
            
        data["missions"][mission] = {
            "completed": completed,
            "timestamp": "2024-08-06T00:00:00"  # 현재 날짜 및 시간으로 변경 가능
        }

        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error saving status: {e}")

# 상태 저장 함수
def save_status(mission: str):
    try:
        # 상태 파일이 없으면 빈 JSON 객체를 생성
        if not os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "w") as f:
                f.write("{}")

        # 상태 파일 읽기
        with open(STATUS_FILE, "r") as f:
            status = json.load(f)

        # 상태 업데이트
        status[mission] = "true"

        # 상태 파일에 다시 쓰기
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
            return {"missions": {}}
    except Exception as e:
        print(f"Error reading status: {e}")
        return {"missions": {}}

@router.get("/quest", response_class=HTMLResponse)
async def quest(request: Request):
    # HTML 템플릿 렌더링
    return templates.TemplateResponse("quest.html", {"request": request})

@router.get("/quest_status")
async def quest_status():
    # 현재 상태를 JSON으로 반환
    status = get_status()
    return JSONResponse(content={"status": status}, status_code=200)

@router.post("/update_quest_stamps")
async def update_quest_stamps(request: Request):
    try:
        data = await request.json()
        mission = data.get("mission")
        completed = data.get("completed", False)
        if mission:
            save_status(mission, completed)
            return JSONResponse(content={"success": True}, status_code=200)
        else:
            return JSONResponse(content={"success": False, "error": "Mission not provided"}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)