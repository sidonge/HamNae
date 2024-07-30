from fastapi.templating import Jinja2Templates
from uuid import uuid4

# Jinja2 템플릿 디렉토리 설정
templates = Jinja2Templates(directory="templates")

# UUID를 문자열로 변환한 세션 ID 반환
def generate_session_id():
    return str(uuid4())

# 세션 데이터를 딕셔너리 형태로 저장
session_data = {}
