from fastapi.templating import Jinja2Templates
from uuid import uuid4

templates = Jinja2Templates(directory="templates")

def generate_session_id():
    return str(uuid4())

session_data = {}