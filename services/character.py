from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from sqlalchemy.orm import Session
from database.db_setup import get_db
from api.models import User
from config import templates, session_data
import os
import traceback

router = APIRouter(tags=["캐릭터 선택"])

@router.get("/character", response_class=HTMLResponse)
async def get_character_page(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    user_info = session_data[session_id]
    user_id = user_info["id"]

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return templates.TemplateResponse("character.html", {
        "request": request,
        "user": user
    })

@router.get("/models/{model_name}")
async def get_model(model_name: str):
    file_path = os.path.join("templates", "models", model_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"error": "File not found"}, status_code=404)

@router.post("/manage_character")
async def manage_character(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        user_id = body.get("user_id")
        pet_id = body.get("pet_id")
        action = body.get("action")

        if not user_id or not pet_id or not action:
            return JSONResponse(content={"error": "Missing user_id, pet_id, or action"}, status_code=400)

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(content={"error": "User not found"}, status_code=404)

        if action == 'purchase':
            if pet_id == 'rabbit':
                if user.coin < 200:
                    return JSONResponse(content={"error": "Insufficient coins"}, status_code=400)
                if 'rabbit' not in user.purchased_pets:
                    user.purchased_pets.append('rabbit')
                user.coin -= 200
                db.commit()
                return JSONResponse(content={"message": "Character purchased successfully", "coin_balance": user.coin})
            else:
                return JSONResponse(content={"error": "Invalid pet_id for purchase"}, status_code=400)
        
        elif action == 'select':
            if pet_id == 'rabbit' and pet_id not in user.purchased_pets:
                return JSONResponse(content={"error": "You need to purchase the rabbit first"}, status_code=400)
            user.main_pet_id = pet_id
            db.commit()
            return JSONResponse(content={"message": "Character selected successfully"})
        
        return JSONResponse(content={"error": "Invalid action"}, status_code=400)

    except Exception as e:
        # 로그에 예외 메시지와 트레이스백을 기록
        print(f"Internal Server Error: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(content={"error": f"Internal Server Error: {str(e)}"}, status_code=500)
    
@router.get("/check_character_purchased/{user_id}", response_class=JSONResponse)
async def check_character_purchased(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return JSONResponse(content={"error": "User not found"}, status_code=404)
    
    return JSONResponse(content={"user_id": user_id, "purchased_pets": user.purchased_pets})

@router.get("/check_character_purchased/{user_id}", response_class=JSONResponse)
async def check_character_purchased(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user_id": user_id, "purchased_pets": user.purchased_pets}

@router.get("/get_user_id")
async def get_user_id(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    user_info = session_data.get(session_id)
    if not user_info or "id" not in user_info:
        raise HTTPException(status_code=401, detail="Invalid session data")

    return JSONResponse(content={"user_id": user_info["id"]})
