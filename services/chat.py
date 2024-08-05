# from fastapi import FastAPI, Request, HTTPException, APIRouter, Depends, Request, Cookie
# from fastapi.responses import HTMLResponse, JSONResponse
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates
# from pydantic import BaseModel
# import logging
# from fastapi.encoders import jsonable_encoder
# import google.generativeai as genai
# import os
# from sqlalchemy.orm import Session
# from sqlalchemy import select
# from database.db_setup import get_db
# from api.models import Pet, UserPet, User
# from config import templates, session_data
# from typing import Optional



# class Message(BaseModel):
#     message: str


# safety_settings = [
#     {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
#     {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
# ]

# router = APIRouter()

# api_key = os.getenv('API_KEY')
# genai.configure(api_key=api_key)
# model = genai.GenerativeModel(
#     'gemini-1.5-flash', safety_settings=safety_settings)
# chat = None

# chat = model.start_chat(history=[{
#     "role": "user",
#     "parts": [{"text": "Can you ask me one routine question after another, such as how was your day? And don't use English."}]
# }])

# templates = Jinja2Templates(directory="templates")


# @router.get("/chat", response_class=HTMLResponse)
# async def get_pets(request: Request, session_id: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
#     print("Received session_id:", session_id)
#     print("Session data:", session_data)
#     # 쿠키에서 세션 ID를 가져오고, 세션 데이터가 유효한지 확인
#     if session_id is None or session_id not in session_data:
#         raise HTTPException(status_code=401, detail="Invalid session")
    
#     # 세션 데이터에서 사용자 정보 가져오기
#     user_info = session_data[session_id]
#     main_pet = user_info['main_pet_id']
#     user_id = user_info.get('id');  
#     print("user_id : "+user_id)

#     # 데이터베이스에서 main_pet과 일치하는 pet 행 가져오기
#     pet = db.execute(select(Pet).where(Pet.pet_id == main_pet)).scalar_one_or_none()
#     if pet is None:
#         raise HTTPException(status_code=404, detail="Pet not found")
    
#     pet_name = pet.name
    
#     # 템플릿 렌더링
#     return templates.TemplateResponse("chat.html", {"request": request, "pet_name": pet_name})





# @router.post("/api/chat")
# async def api_chat(message: Message):
#     if chat is None:
#         raise HTTPException(
#             status_code=500, detail="Chat session not initialized")

#     response = chat.send_message(message.message)
#     response_content = response.text if hasattr(
#         response, 'text') else str(response)
#     return JSONResponse(content={"response": response_content})


