from fastapi import APIRouter
from services.log_service import fetch_logs

router = APIRouter()

@router.get("/logs")
def get_logs():
    return fetch_logs()
