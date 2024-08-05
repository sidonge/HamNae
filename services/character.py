from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from database.db_setup import get_db
from api.models import User, UserPet, Pet
from config import templates, session_data
import os
import traceback
from pydantic import BaseModel  # Pydantic의 BaseModel 임포트

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

    # 사용자 소유의 애완동물 가져오기
    user_pets = db.query(UserPet).filter(UserPet.user_id == user_id).all()
    pet_ids = [user_pet.pet_id for user_pet in user_pets]

    # 애완동물 정보 가져오기
    pets = db.query(Pet).filter(Pet.pet_id.in_(['hamster', 'bear', 'rabbit'])).all()

    # 소유 여부에 따른 버튼 텍스트 설정
    pet_buttons = {}
    for pet in pets:
        if pet.pet_id in pet_ids:
            pet_buttons[pet.pet_id] = "선택하기"
        else:
            pet_buttons[pet.pet_id] = "구매하기"

    return templates.TemplateResponse("character.html", {
        "request": request,
        "user": user,
        "pets": pets,
        "pet_buttons": pet_buttons
    })


class PetPurchaseRequest(BaseModel):
    pet_id: str

@router.post("/purchase_pet")
async def purchase_pet(request: PetPurchaseRequest, request_obj: Request, db: Session = Depends(get_db)):
    session_id = request_obj.cookies.get("session_id")
    if not session_id or session_id not in session_data:
        raise HTTPException(status_code=401, detail="세션이 유효하지 않습니다.")

    user_info = session_data[session_id]
    user_id = user_info["id"]

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    pet = db.query(Pet).filter(Pet.pet_id == request.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="애완동물을 찾을 수 없습니다.")
    
    if pet.price is None:
        raise HTTPException(status_code=400, detail="이 애완동물은 구매할 수 없습니다.")

    existing_pet = db.query(UserPet).filter(UserPet.user_id == user_id, UserPet.pet_id == request.pet_id).first()
    if existing_pet:
        raise HTTPException(status_code=400, detail="애완동물이 이미 구매되었습니다.")

    if user.coin < pet.price:
        raise HTTPException(status_code=400, detail="코인이 부족합니다.")

    new_user_pet = UserPet(user_id=user_id, pet_id=request.pet_id)
    db.add(new_user_pet)
    
    user.coin -= pet.price

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="데이터베이스 오류가 발생했습니다.")
    
    return {"message": "애완동물이 성공적으로 구매되었습니다."}

class MainPetUpdateRequest(BaseModel):
    pet_id: str

@router.post("/update_main_pet")
async def update_main_pet(request: MainPetUpdateRequest, request_obj: Request, db: Session = Depends(get_db)):
    session_id = request_obj.cookies.get("session_id")
    if not session_id or session_id not in session_data:
        raise HTTPException(status_code=401, detail="세션이 유효하지 않습니다.")

    user_info = session_data[session_id]
    user_id = user_info["id"]

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    pet = db.query(Pet).filter(Pet.pet_id == request.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="애완동물을 찾을 수 없습니다.")

    # 애완동물이 사용자의 구매 목록에 있는지 확인
    user_pet = db.query(UserPet).filter(UserPet.user_id == user_id, UserPet.pet_id == request.pet_id).first()
    if not user_pet:
        raise HTTPException(status_code=400, detail="선택한 애완동물이 구매되지 않았습니다.")

    # 사용자의 main_pet_id 업데이트
    user.main_pet_id = request.pet_id

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="데이터베이스 오류가 발생했습니다.")
    
    return {"message": "주 애완동물이 성공적으로 업데이트되었습니다."}
# ------- 지아 -------

# @router.get("/character", response_class=HTMLResponse)
# async def get_character_page(request: Request, db: Session = Depends(get_db)):
#     session_id = request.cookies.get("session_id")
#     if not session_id or session_id not in session_data:
#         raise HTTPException(status_code=401, detail="Invalid session")

#     user_info = session_data[session_id]
#     user_id = user_info["id"]

#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     # 'rabbit'이 user_pet 테이블에 있는지 확인
#     rabbit_owned = db.query(UserPet).filter(UserPet.user_id == user_id, UserPet.pet_id == 'rabbit').first() is not None

#     return templates.TemplateResponse("character.html", {
#         "request": request,
#         "user": user,
#         "rabbit_owned": rabbit_owned
#     })

# @router.get("/user_info/{user_id}", response_class=JSONResponse)
# async def get_user_info(user_id: str, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         return JSONResponse(content={"error": "User not found"}, status_code=404)

#     # 사용자 정보를 반환 (여기에 필요한 추가 정보를 포함)
#     purchased_pets = db.query(UserPet.pet_id).filter(UserPet.user_id == user_id).all()
#     return JSONResponse(content={
#         "user_id": user.id,
#         "username": user.name,
#         "coin_balance": user.coin,
#         "purchased_pets": [pet.pet_id for pet in purchased_pets]
#     })

# @router.get("/available_characters", response_class=JSONResponse)
# async def get_available_characters():
#     characters = [
#         {"pet_id": "hamster", "name": "햄깅이", "description": "햄깅이는 잠이 많은 햄스터예요."},
#         {"pet_id": "bear", "name": "곰식이", "description": "동식이는 진중하고 과묵한 곰이에요."},
#         {"pet_id": "rabbit", "name": "교수님", "description": "교수님은 지혜로운 토끼로서 많은 지식을 가지고 있어요."}
#     ]
#     return JSONResponse(content={"available_characters": characters})

# @router.get("/models/{model_name}")
# async def get_model(model_name: str):
#     safe_model_names = ["ham.glb", "bear.glb", "whiterabbit.glb"]  # 허용된 모델 목록
#     if model_name not in safe_model_names:
#         return JSONResponse(content={"error": "File not found"}, status_code=404)

#     file_path = os.path.join("templates", "models", model_name)
#     if os.path.exists(file_path):
#         return FileResponse(file_path)
#     return JSONResponse(content={"error": "File not found"}, status_code=404)

# @router.post("/manage_character")
# async def manage_character(request: Request, db: Session = Depends(get_db)):
#     try:
#         body = await request.json()
#         user_id = body.get("user_id")
#         pet_id = body.get("pet_id")
#         action = body.get("action")

#         if not user_id or not pet_id or not action:
#             return JSONResponse(content={"error": "Missing user_id, pet_id, or action"}, status_code=400)

#         user = db.query(User).filter(User.id == user_id).first()
#         if not user:
#             return JSONResponse(content={"error": "User not found"}, status_code=404)

#         if action == 'purchase':
#             if pet_id == 'rabbit':
#                 if user.coin < 200:
#                     return JSONResponse(content={"error": "Insufficient coins"}, status_code=400)

#                 # Check if the pet is already owned
#                 user_pet = db.query(UserPet).filter(UserPet.user_id == user_id, UserPet.pet_id == 'rabbit').first()
#                 if user_pet is None:
#                     new_user_pet = UserPet(user_id=user_id, pet_id='rabbit')
#                     db.add(new_user_pet)

#                 # Deduct coins
#                 user.coin -= 200
#                 db.commit()

#                 return JSONResponse(content={"message": "Character purchased successfully", "coin_balance": user.coin})

#             return JSONResponse(content={"error": "Invalid pet_id for purchase"}, status_code=400)

#         elif action == 'select':
#             if pet_id == 'rabbit' and not db.query(UserPet).filter(UserPet.user_id == user_id, UserPet.pet_id == 'rabbit').first():
#                 return JSONResponse(content={"error": "You need to purchase the rabbit first"}, status_code=400)
#             user.main_pet_id = pet_id
#             db.commit()
#             return JSONResponse(content={"message": "Character selected successfully"})

#         return JSONResponse(content={"error": "Invalid action"}, status_code=400)

#     except Exception as e:
#         print(f"Internal Server Error: {str(e)}")
#         print(traceback.format_exc())
#         return JSONResponse(content={"error": f"Internal Server Error: {str(e)}"}, status_code=500)

# @router.get("/check_character_purchased/{user_id}", response_class=JSONResponse)
# async def check_character_purchased(user_id: str, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         return JSONResponse(content={"error": "User not found"}, status_code=404)
    
#     purchased_pets = [pet.pet_id for pet in user.purchased_pets]
#     return JSONResponse(content={"user_id": user_id, "purchased_pets": purchased_pets})

# @router.get("/get_user_id")
# async def get_user_id(request: Request):
#     session_id = request.cookies.get("session_id")
#     if not session_id or session_id not in session_data:
#         raise HTTPException(status_code=401, detail="Invalid session")

#     user_info = session_data.get(session_id)
#     if not user_info or "id" not in user_info:
#         raise HTTPException(status_code=401, detail="Invalid session data")

#     return JSONResponse(content={"user_id": user_info["id"]})

# @router.get("/user_info/{user_id}", response_class=JSONResponse)
# async def get_user_info(user_id: str, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         return JSONResponse(content={"error": "User not found"}, status_code=404)

#     # 사용자 정보를 반환 (여기에 필요한 추가 정보를 포함)
#     purchased_pets = db.query(UserPet.pet_id).filter(UserPet.user_id == user_id).all()
#     return JSONResponse(content={
#         "user_id": user.id,
#         "username": user.name,
#         "coin_balance": user.coin,
#         "purchased_pets": [pet.pet_id for pet in purchased_pets]
#     })


# @router.post("/get_owned_characters", response_class=JSONResponse)
# async def get_owned_characters(request: Request, db: Session = Depends(get_db)):
#     try:
#         body = await request.json()
#         user_id = body.get("user_id")
#         if not user_id:
#             raise HTTPException(status_code=400, detail="User ID is required")

#         # 사용자가 소유한 캐릭터를 조회
#         owned_pets = db.query(UserPet.pet_id).filter(UserPet.user_id == user_id).all()
#         owned_pet_ids = [pet.pet_id for pet in owned_pets]

#         return JSONResponse(content={"owned_characters": owned_pet_ids})
#     except Exception as e:
#         return JSONResponse(content={"error": f"Internal Server Error: {str(e)}"}, status_code=500)
    
# @router.post("/update_coin_balance")
# async def update_coin_balance(request: Request, db: Session = Depends(get_db)):
#     try:
#         body = await request.json()
#         user_id = body.get("user_id")
#         coin_amount = body.get("coin_amount")

#         if not user_id or coin_amount is None:
#             return JSONResponse(content={"error": "Missing user_id or coin_amount"}, status_code=400)

#         user = db.query(User).filter(User.id == user_id).first()
#         if not user:
#             return JSONResponse(content={"error": "User not found"}, status_code=404)

#         user.coin += coin_amount
#         db.commit()

#         return JSONResponse(content={"message": "Coin balance updated successfully", "coin_balance": user.coin})
#     except Exception as e:
#         print(f"Internal Server Error: {str(e)}")
#         return JSONResponse(content={"error": f"Internal Server Error: {str(e)}"}, status_code=500)
