# popup.py
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/popup")
async def get_popup():
    return FileResponse("templates/home.html")
