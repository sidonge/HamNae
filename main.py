from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from typing import Optional

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
templates = Jinja2Templates(directory="templates")

# 업로드 디렉토리 설정
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 클리어 상태를 저장할 파일
STATUS_FILE = "status.json"

# 미션 이름과 스탬프 파일명 맵핑
stampMap = {
    'water': 'water_cleared_stamp',
    'clean': 'broomstick_cleared_stamp',
    'cooking': 'pot_cleared_stamp',
    'wash': 'bath_cleared_stamp',
    'bed': 'meditation_cleared_stamp'
}

def save_status(mission: str):
    try:
        # 파일이 없으면 새로 생성
        if not os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "w") as f:
                f.write("{}")
        
        # 상태 파일 읽기
        with open(STATUS_FILE, "r") as f:
            status = json.load(f)
        
        # 상태 업데이트
        status[mission] = "true"
        
        # 상태 파일에 저장
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

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 로그 추가
        print(f"Received file: {file.filename}")
        
        # 파일 이름에서 미션 이름 추출
        mission = file.filename.split('_')[0].lower()  # 예: "waterUpload"에서 "water" 추출
        print(f"Extracted mission: {mission}")
        
        if mission not in stampMap:
            print(f"Invalid mission: {mission}")
            return JSONResponse(content={"success": False, "error": "Invalid mission"}, status_code=400)

        # 파일 저장 경로 설정 및 파일명 변경
        new_filename = stampMap[mission] + os.path.splitext(file.filename)[1]
        file_location = os.path.join(UPLOAD_DIR, new_filename)
        print(f"Saving file to: {file_location}")

        # 파일 저장
        with open(file_location, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # 미션 상태 저장
        save_status(mission)

        return JSONResponse(content={"success": True, "file_path": file_location}, status_code=200)
    except Exception as e:
        print(f"Error: {e}")
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

@app.get("/character", response_class=HTMLResponse)
async def quest(request: Request):
    return templates.TemplateResponse("character.html", {"request": request})

@app.get("/models/{model_name}")
async def get_model(model_name: str):
    file_path = os.path.join("templates", "models", model_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"success": False, "error": "File not found"}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
