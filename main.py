from fastapi import FastAPI, Request
from fastapi.responses import  HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from map import router as map_router
from auth import login, register
from services import quest, home, character, walkpage, petlist

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
app.include_router(map_router)

app.include_router(home.router, prefix="/services")
app.include_router(character.router, prefix="/services")
app.include_router(quest.router, prefix="/services")
app.include_router(walkpage.router, prefix="/services")
app.include_router(petlist.router, prefix="/services")

@app.get("/", response_class=HTMLResponse)
async def get_loading(request: Request):
    return templates.TemplateResponse("loading.html", {"request": request})

# 챗봇
# google gemini api 사용
import google.generativeai as genai
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import logging
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# API 키를 읽는 함수


def read_api_key(filepath):
    try:
        with open(filepath, 'r') as file:
            return file.read()  # 공백 문자 제거
    except Exception as e:
        logging.error(f"Failed to read the API key: {e}")
        raise e


safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
    },
]


# API 키 설정
api_key = read_api_key('apikey.txt')
genai.configure(api_key=api_key)

# gemini-1.5-flash 모델 사용
model = genai.GenerativeModel(
    'gemini-1.5-flash', safety_settings=safety_settings)

# 초기 메시지 설정
initial_message = {
    "text": "I'm going to have a dialogue with you now for emotional healing. Can you ask me one routine question after another, such as how was your day, did you eat properly, etc.? Your first answer should be How was your day?",
    "role": "user"
}

try:
    # 초기 메시지와 함께 채팅 세션 시작
    chat = model.start_chat(history=[initial_message])
except Exception as e:
    print(f"Error starting chat session: {str(e)}")


chat = model.start_chat()


class Message(BaseModel):
    message: str


@app.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})


@app.post("/api/chat")
async def api_chat(message: Message):
    try:
        response = chat.send_message(message.message)
        logging.debug(f"Full response object: {response}")
        response_content = response.text if hasattr(
            response, 'text') else str(response)

        response_data = jsonable_encoder({
            "response": response_content,
        })
        return JSONResponse(content=response_data)
    except Exception as e:
        logging.error(f"Exception during chat processing: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")








if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")