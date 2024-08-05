from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from config import templates

router = APIRouter(tags=["펫리스트"])

@router.get("/petlist", response_class=HTMLResponse)
async def petlist(request: Request):
    return templates.TemplateResponse("petlist.html", {"request": request})
