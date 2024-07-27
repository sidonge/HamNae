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

# Create FastAPI app instance
app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")
# Setup template rendering with Jinja2
templates = Jinja2Templates(directory="templates")

# Replace with your actual Google API Key
GOOGLE_API_KEY = "AIzaSyC3OFSGbanwYPF2juMflB68ajQH6qyh13o"
# Configure the API key for the generative AI model
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the model and start a chat session
model = genai.GenerativeModel('gemini-1.5-flash')
# 초기 메시지 설정
initial_message = {
    "text": "난 지금 너에게 정서적 치유를 위해 너와 대화를 할거야. 오늘 하루는 어땠는지, 밥은 제대로 먹었는지와 같은 일상적인 질문을 차례로 해줄래? 그리고 질문할 때는 하나씩 차례대로 질문해줘.",
    "role": "user"  # 또는 'model', 필요에 따라 설정
}

chat = model.start_chat(history=[])

try:
    chat = model.start_chat(history=[initial_message])
except Exception as e:
    print(f"Error starting chat session: {str(e)}")
    # 적절한 오류 처리 로직 추가

# Define the data model for received messages
class Message(BaseModel):
    message: str

# Route to serve the chat HTML page
@app.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.post("/api/chat")
async def api_chat(message: Message):
    try:
        response = chat.send_message(message.message)
        logging.debug(f"Full response object: {response}")
        logging.debug(f"Available attributes in response: {dir(response)}")
        
        # Assuming you might need to access a method or convert response to a dictionary
        response_content = response.text if hasattr(response, 'text') else str(response)
        
        response_data = jsonable_encoder({
            "response": response_content,
            "history": [msg.text if hasattr(msg, 'text') else str(msg) for msg in chat.history]
        })
        return JSONResponse(content=response_data)
    except Exception as e:
        logging.error(f"Exception during chat processing: {e}")
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(e)}"})


# Main entry point for running the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
