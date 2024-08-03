from fastapi import FastAPI, Request
from fastapi.responses import  HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from map import router as map_router
from api.pet import router as pet_router
from api.mypet import router as mainpet_router
from api.quest import router as quest_router
from auth import login, register
from user import petlist, mypage
from services import walkpage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 라우터 등록
app.include_router(login.router, prefix="/auth")
app.include_router(register.router, prefix="/auth")

# # 업로드 디렉토리 설정
# UPLOAD_DIR = "./uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # 클리어 상태를 저장할 파일
# STATUS_FILE = "status.json"

# # 미션과 파일 이름 매핑
# STAMP_MAP = {
#     'water': 'water_cleared_stamp.png',
#     'clean': 'clean_cleared_stamp.png',
#     'cooking': 'cooking_cleared_stamp.png',
#     'wash': 'wash_cleared_stamp.png',
#     'bed': 'bed_cleared_stamp.png',
#     'pills':'pills_cleared_stamp',
#     'talk':'talk_cleared_stamp',
# }

# def save_status(mission: str):
#     try:
#         # 파일이 없으면 새로 생성
#         if not os.path.exists(STATUS_FILE):
#             with open(STATUS_FILE, "w") as f:
#                 f.write("{}")
        
#         # 상태 파일 읽기
#         with open(STATUS_FILE, "r") as f:
#             status = json.load(f)
        
#         # 상태 업데이트
#         status[mission] = "true"
        
#         # 상태 파일에 저장
#         with open(STATUS_FILE, "w") as f:
#             json.dump(status, f)
#     except Exception as e:
#         print(f"Error saving status: {e}")

# def get_status():
#     try:
#         if os.path.exists(STATUS_FILE):
#             with open(STATUS_FILE, "r") as f:
#                 return json.load(f)
#         else:
#             return {}
#     except Exception as e:
#         print(f"Error reading status: {e}")
#         return {}

@app.get("/", response_class=HTMLResponse)
async def main(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

# @app.get("/walkpage", response_class=HTMLResponse)
# async def quest(request: Request):
#     return templates.TemplateResponse("walkpage.html", {"request": request})

# @app.get("/petslist")
# async def petslist(request: Request):
#     return templates.TemplateResponse("petslist.html", {"request": request})

@app.get("/quest", response_class=HTMLResponse)
async def quest(request: Request):
    return templates.TemplateResponse("quest.html", {"request": request})

# @app.get("/quest_status")
# async def quest_status():
#     status = get_status()
#     return JSONResponse(content={"status": status}, status_code=200)

# @app.post("/upload")
# async def upload_file(file: UploadFile = File(...)):
#     try:
#         mission = file.filename.split('_')[0].lower()
#         new_filename = STAMP_MAP.get(mission, file.filename)
#         file_location = os.path.join(UPLOAD_DIR, new_filename)
#         with open(file_location, "wb") as f:
#             shutil.copyfileobj(file.file, f)
#         save_status(mission)
#         return JSONResponse(content={"success": True, "file_path": file_location}, status_code=200)
#     except Exception as e:
#         return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

# @app.post("/update_quest_stamps")
# async def update_quest_stamps(request: Request):
#     try:
#         data = await request.json()
#         mission = data.get("mission")
#         if mission:
#             save_status(mission)
#             return JSONResponse(content={"success": True}, status_code=200)
#         else:
#             return JSONResponse(content={"success": False, "error": "Mission not provided"}, status_code=400)
#     except Exception as e:
#         return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

# @app.get("/", response_class=HTMLResponse)
# async def get_chat(request: Request):
#     return templates.TemplateResponse("chat.html", {"request": request})


# @app.post("/api/chat")
# async def api_chat(message: Message):
#     try:
#         response = chat.send_message(message.message)
#         logging.debug(f"Full response object: {response}")
#         response_content = response.text if hasattr(
#             response, 'text') else str(response)

#         response_data = jsonable_encoder({
#             "response": response_content,
#         })
#         return JSONResponse(content=response_data)
#     except Exception as e:
#         logging.error(f"Exception during chat processing: {e}")
#         return JSONResponse(status_code=500, content={"detail": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

app.include_router(pet_router)
app.include_router(mainpet_router)

app.include_router(quest_router)
app.include_router(petlist.router, prefix="/user")
app.include_router(mypage.router, prefix="/user")
app.include_router(map_router)
app.include_router(walkpage.router)