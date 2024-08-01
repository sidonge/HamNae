import google.generativeai as genai
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import logging
from fastapi.encoders import jsonable_encoder

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# API 키를 읽는 함수
def read_api_key(filepath):
    try:
        with open(filepath, 'r') as file:
            return file.read().strip()  # 공백 문자 제거
    except Exception as e:
        logging.error(f"Failed to read the API key: {e}")
        raise e

# API 키 설정
try:
    api_key = read_api_key('apikey.txt')
except Exception as e:
    raise RuntimeError("Failed to read API key")

# 나쁜말 나오면 영어 오류 나오는 부분 수정
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

# gemini-1.5-flash 모델 초기화
def get_model(api_key):
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash', safety_settings=safety_settings)
    except Exception as e:
        logging.error(f"Failed to configure the model: {e}")
        raise e

model = None
chat = None

@app.on_event("startup")
async def startup_event():
    global model, chat
    try:
        model = get_model(api_key)
        logging.info("Model configured successfully.")
        
        # 초기 메시지 설정
        initial_message = {
            "role": "user",
            "parts": [
                {
                    "text": "I'm going to have a dialogue with you now for emotional healing. Can you ask me one routine question after another, such as how was your day, did you eat properly, etc.? Use emojis that give me a warm feeling."
                }
            ]
        }
        
        chat = model.start_chat(history=[initial_message])
        logging.info("Chat session started successfully.")
    except Exception as e:
        logging.error(f"Error starting chat session: {str(e)}")
        raise RuntimeError("Failed to start chat session")

class Message(BaseModel):
    message: str

@app.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.post("/api/chat")
async def api_chat(message: Message):
    try:
        if chat is None:
            raise HTTPException(status_code=500, detail="Chat session not initialized")
        
        response = chat.send_message(message.message)
        logging.debug(f"Full response object: {response}")
        response_content = response.text if hasattr(response, 'text') else str(response)

        return JSONResponse(content={"response": response_content})
    except Exception as e:
        logging.error(f"Exception during chat processing: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
