from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from services.alert_service import update_and_fetch_alerts

router = APIRouter()

@router.get("/alerts")
def get_alerts():
    return update_and_fetch_alerts()
