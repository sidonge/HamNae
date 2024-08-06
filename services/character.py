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

    # 애완동물 정보 가져오기 (sort_order에 따라 정렬)
    pets = db.query(Pet).filter(Pet.pet_id.in_(['hamster', 'bear', 'rabbit'])).order_by(Pet.sort_order).all()

    # 소유 여부에 따른 버튼 텍스트 및 이미지 설정
    pet_buttons = {}
    pet_images = {}
    pet_models = {}

    for pet in pets:
        if pet.pet_id == 'rabbit':
            # rabbit의 경우 구매 여부에 따라 이미지 파일 이름 설정
            if pet.pet_id not in pet_ids:
                # rabbit이 구매되지 않은 경우
                pet_buttons[pet.pet_id] = "구매하기"
                pet_images[pet.pet_id] = "ham4.png"
                pet_models[pet.pet_id] = pet.model_path

            elif  pet.pet_id == user.main_pet_id:
                pet_images[pet.pet_id] = "ham3.png"
                pet_buttons[pet.pet_id] = "선택됨"
                pet_models[pet.pet_id] = pet.model_path
            else:
                 # rabbit이 구매된 경우
                pet_buttons[pet.pet_id] = "선택하기"
                pet_images[pet.pet_id] = "ham3.png"
                pet_models[pet.pet_id] = pet.model_path

        else:
            # 다른 애완동물의 경우
            if pet.pet_id == user.main_pet_id:
                pet_buttons[pet.pet_id] = "선택됨"
            else:
                pet_buttons[pet.pet_id] = "선택하기"
            pet_images[pet.pet_id] = f"ham{pet.sort_order}.png"

    # Debugging Output (임시로 로그를 확인할 수 있습니다)
    print("Pet IDs:", pet_ids)
    print("Pet Buttons:", pet_buttons)
    print("Pet Images:", pet_images)

    return templates.TemplateResponse("character.html", {
        "request": request,
        "user": user,
        "pets": pets,
        "pet_buttons": pet_buttons,
        "pet_images": pet_images ,
        "pet_models": pet_models
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