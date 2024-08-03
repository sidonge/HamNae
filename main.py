from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from auth import login, register
from services import quest, home, character, walkpage, petlist, chat, map
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

app.include_router(map.router)
app.include_router(home.router)
app.include_router(character.router)
app.include_router(quest.router)
app.include_router(walkpage.router)
app.include_router(petlist.router)
app.include_router(chat.router)


@app.get("/", response_class=HTMLResponse)
async def get_loading(request: Request):
    return templates.TemplateResponse("loading.html", {"request": request})
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
    uvicorn.run(app, host="127.0.0.1", port=8000)

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