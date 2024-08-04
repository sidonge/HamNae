from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["펫리스트"])

templates = Jinja2Templates(directory="templates")
router = APIRouter(tags=["펫리스트"])


@router.get("/petlist", response_class=HTMLResponse)
async def petlist(request: Request):
    return templates.TemplateResponse("petlist.html", {"request": request})
