from fastapi import APIRouter
from services.log_service import update_and_fetch_logs

router = APIRouter()

@router.get("/logs")
def get_logs():
    return update_and_fetch_logs()
