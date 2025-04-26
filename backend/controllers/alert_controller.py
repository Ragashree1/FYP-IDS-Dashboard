from fastapi import APIRouter
from services.alert_service import update_and_fetch_alerts

router = APIRouter()

@router.get("/alerts/{orgId}")
def get_alerts(org_id: int):
    return update_and_fetch_alerts(org_id)
