from fastapi import Cookie, HTTPException
from config import session_data

# 세션 ID를 통해 현재 사용자 정보 가져오기
def get_current_user(session_id: str = Cookie(None)):
    if session_id and session_id in session_data:
        return session_data[session_id] # 유효한 세션 ID일 경우 사용자 정보 반환
    return None # 유효하지 않은 세션 ID일 경우 None 반환