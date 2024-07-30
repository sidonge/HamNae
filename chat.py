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

# API 키 설정
api_key = read_api_key('apikey.txt')
genai.configure(api_key=api_key)


# gemini-1.5-flash 모델 사용
model = genai.GenerativeModel('gemini-1.5-flash')
# 초기 메시지 설정
initial_message = {
    "text": "난 지금 너에게 정서적 치유를 위해 너와 대화를 할거야. 오늘 하루는 어땠는지, 밥은 제대로 먹었는지와 같은 일상적인 질문을 차례로 해줄래? 너의 첫 답은 오늘하루는 어땠나요? 라고 해줘 .",
    "role": "user" 
}

chat = model.start_chat(history=[])

try:
    chat = model.start_chat(history=[initial_message])
except Exception as e:
    print(f"Error starting chat session: {str(e)}")
    # 적절한 오류 처리 로직 추가


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
        response_content = response.text if hasattr(response, 'text') else str(response)
        
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
