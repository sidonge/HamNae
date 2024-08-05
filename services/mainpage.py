from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from config import templates

router = APIRouter(tags=["메인페이지"])

@router.get("/main", response_class=HTMLResponse)
async def petlist(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})