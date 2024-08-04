import os

# 환경 변수에서 API_KEY를 읽어오기
api_key = os.getenv('MAP_API_KEY')

# API_KEY가 정상적으로 읽어졌는지 확인
if api_key is None:
    print("API_KEY 환경 변수가 설정되지 않았습니다.")
else:
    print(f"API_KEY: {api_key}")