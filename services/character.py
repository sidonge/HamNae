from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from config import templates

router = APIRouter(tags=["캐릭터 선택"])

@router.get("/character", response_class=HTMLResponse)
async def read_character(request: Request):
    return templates.TemplateResponse("character.html", {"request": request})