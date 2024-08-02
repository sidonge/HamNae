from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import logging
from fastapi.encoders import jsonable_encoder
import google.generativeai as genai
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

router = APIRouter()

# API 키를 읽는 함수
def read_api_key(filepath):
    try:
        with open(filepath, 'r') as file:
            return file.read().strip()  # 공백 문자 제거
    except Exception as e:
        logging.error(f"Failed to read the API key: {e}")
        raise e

api_key = read_api_key('apikey.txt')

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
]

def get_model(api_key):
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash', safety_settings=safety_settings)
    except Exception as e:
        logging.error(f"Failed to configure the model: {e}")
        raise e

model = get_model(api_key)
chat = None

@router.on_event("startup")
async def startup_event():
    global chat
    try:
        # 초기 메시지 설정
        initial_message = {
            "role": "user",
            "parts": [{"text": "Can you ask me one routine question after another, such as how was your day?"}]
        }
        chat = model.start_chat(history=[initial_message])
        logging.info("Chat session started successfully.")
    except Exception as e:
        logging.error(f"Error starting chat session: {str(e)}")
        raise RuntimeError("Failed to start chat session")

class Message(BaseModel):
    message: str

@router.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@router.post("/api/chat")
async def api_chat(message: Message):
    if chat is None:
        raise HTTPException(status_code=500, detail="Chat session not initialized")
    
    response = chat.send_message(message.message)
    response_content = response.text if hasattr(response, 'text') else str(response)
    return JSONResponse(content={"response": response_content})

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
