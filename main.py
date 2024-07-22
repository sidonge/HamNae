from typing import Union
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/signup")
def signup_form(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.get("/login")
def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})