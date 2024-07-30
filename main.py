from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from config import templates, session_data
from auth import login, register
from user import mypage

app = FastAPI()

# 정적 파일을 제공하기 위한 설정
app.mount("/static", StaticFiles(directory="static"), name="static")

# 인증 관련 라우터 등록
app.include_router(login.router, prefix="/auth")  # 로그인
app.include_router(register.router, prefix="/auth")  # 회원가입

# 사용자 관련 라우터 등록
app.include_router(mypage.router, prefix="/user") # 마이페이지

@app.get("/", response_class=JSONResponse)
def read_root():
    return {"message": "Welcome to FastAPI"}
