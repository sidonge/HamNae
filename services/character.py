from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from config import templates

router = APIRouter()

@router.get("/character", response_class=HTMLResponse)
async def read_character(request: Request):
    return templates.TemplateResponse("character.html", {"request": request})