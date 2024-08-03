# from fastapi import FastAPI, Request, HTTPException, APIRouter
# from fastapi.responses import HTMLResponse, JSONResponse
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates
# from pydantic import BaseModel
# import logging
# from fastapi.encoders import jsonable_encoder
# import google.generativeai as genai
# import os


# class Message(BaseModel):
#     message: str


# safety_settings = [
#     {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
#     {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
# ]

# router = APIRouter()

# api_key = os.getenv('API_KEY')
# print("이거야", api_key)
# genai.configure(api_key=api_key)
# model = genai.GenerativeModel(
#     'gemini-1.5-flash', safety_settings=safety_settings)
# chat = None

# chat = model.start_chat(history=[{
#     "role": "user",
#     "parts": [{"text": "Can you ask me one routine question after another, such as how was your day?"}]
# }])

# templates = Jinja2Templates(directory="templates")


# @router.get("/chat", response_class=HTMLResponse)
# async def get_chat(request: Request):
#     return templates.TemplateResponse("chat.html", {"request": request})


# @router.post("/api/chat")
# async def api_chat(message: Message):
#     if chat is None:
#         raise HTTPException(
#             status_code=500, detail="Chat session not initialized")

#     response = chat.send_message(message.message)
#     response_content = response.text if hasattr(
#         response, 'text') else str(response)
#     return JSONResponse(content={"response": response_content})
