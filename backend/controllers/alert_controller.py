from fastapi import APIRouter
from services.alert_service import update_and_fetch_alerts

router = APIRouter()

@router.get("/alerts")
def get_alerts():
    return update_and_fetch_alerts()
