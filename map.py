from fastapi import APIRouter
import os

router = APIRouter()

# def get_api_key() -> str:
#     api_key_file_path = "mapapikey.txt"
#     if os.path.exists(api_key_file_path):
#         print("mapapikey.txt존재")
#         with open(api_key_file_path, 'r') as file:
#             return file.read().strip()
#     else:
#         return "default_key_if_not_set"

@router.get("/api/get-api-key")
def get_api_key_route():
    map_api_key = os.getenv('MAP_API_KEY')
    print("이거야", map_api_key)
    return {"api_key": map_api_key}
