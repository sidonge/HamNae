from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from config import templates
import os

router = APIRouter(tags=["캐릭터 선택"])

@router.get("/character", response_class=HTMLResponse)
async def read_character(request: Request):
    return templates.TemplateResponse("character.html", {"request": request})

@router.get("/models/{model_name}")
async def get_model(model_name: str):
    file_path = os.path.join("templates", "models", model_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"success": False, "error": "File not found"}, status_code=404)