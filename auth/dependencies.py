# auth/dependencies.py

from fastapi import Cookie, HTTPException
from config import session_data

def get_current_user(session_id: str = Cookie(None)):
    if session_id and session_id in session_data:
        return session_data[session_id]
    return None