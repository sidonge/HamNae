from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from database.db_setup import get_db
from api.models import UserPet
from config import templates
import os

router = APIRouter(tags=["캐릭터 선택"])

@router.get("/character", response_class=HTMLResponse)
async def get_character_page(request: Request):
    return templates.TemplateResponse("character.html", {"request": request})

@router.get("/models/{model_name}")
async def get_model(model_name: str):
    file_path = os.path.join("templates", "models", model_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"success": False, "error": "File not found"}, status_code=404)

@router.post("/select_character")
async def select_character(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    user_id = data.get('user_id')
    pet_id = data.get('pet_id')

    if not user_id or not pet_id:
        raise HTTPException(status_code=400, detail="Missing user_id or pet_id")

    # Reset all selections to 0
    db.execute(
        update(UserPet)
        .where(UserPet.user_id == user_id)
        .values(selected_character=0)
    )
    
    # Set default hamster selection to 1
    db.execute(
        update(UserPet)
        .where(UserPet.user_id == user_id, UserPet.pet_id == 'hamster')
        .values(selected_character=1)
    )
    db.commit()

    # If another pet is chosen, update the selection accordingly
    if pet_id != 'hamster':
        db.execute(
            update(UserPet)
            .where(UserPet.user_id == user_id, UserPet.pet_id == pet_id)
            .values(selected_character=1)
        )
        db.execute(
            update(UserPet)
            .where(UserPet.user_id == user_id, UserPet.pet_id == 'hamster')
            .values(selected_character=0)
        )
        db.commit()

    return {"status": "success", "message": "Character selected successfully"}


@router.get("/selected_character/{user_id}", response_class=JSONResponse)
async def get_selected_character(user_id: str, db: Session = Depends(get_db)):
    selected_character_query = select(UserPet).where(UserPet.user_id == user_id, UserPet.selected_character == 1)
    result = db.execute(selected_character_query)
    selected_pet = result.scalars().first()

    if not selected_pet:
        raise HTTPException(status_code=404, detail="No selected character found for the user")

    return {"user_id": user_id, "selected_pet_id": selected_pet.pet_id}
