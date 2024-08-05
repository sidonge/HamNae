from fastapi import APIRouter
import os

router = APIRouter(tags=["지도"])


@router.get("/api/get-api-key")
def get_api_key_route():
    api_key = os.getenv('MAP_API_KEY')
    return {"api_key": api_key}
