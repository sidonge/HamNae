from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from config import templates

router = APIRouter()

@router.get("/walkpage", response_class=HTMLResponse)
async def quest(request: Request):
    return templates.TemplateResponse("walkpage.html", {"request": request})