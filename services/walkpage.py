from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from config import templates

router = APIRouter(tags=["산책"])

@router.get("/walkpage", response_class=HTMLResponse)
async def quest(request: Request):
    return templates.TemplateResponse("walkpage.html", {"request": request})