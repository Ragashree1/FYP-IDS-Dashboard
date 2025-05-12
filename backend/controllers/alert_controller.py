from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from services.alert_service import update_and_fetch_alerts, fetch_alerts_by_org

router = APIRouter()

@router.get("/alerts")
def get_alerts():
    return update_and_fetch_alerts()

@router.get("/alerts/org/{organization_id}")
def get_alerts_by_org(organization_id: int):
    return fetch_alerts_by_org(organization_id)