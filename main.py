from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from auth import login, register
from services import quest, home, character, walkpage, petlist, chat, map
from user import mypage, petlist
from api import voiceRecording


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

app.include_router(mainpage.router)
app.include_router(map.router)
app.include_router(home.router)
app.include_router(character.router)
app.include_router(quest.router)
app.include_router(walkpage.router)
app.include_router(petlist.router)

# app.include_router(chat.router)

app.include_router(mypage.router, prefix="/user")



@app.get("/", response_class=HTMLResponse)
async def get_loading(request: Request):
    return templates.TemplateResponse("loading.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

app.include_router(petlist.router, prefix="/user")
app.include_router(mypage.router, prefix="/user")

app.include_router(walkpage.router)

app.include_router(voiceRecording.router)