from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from services.event_service import fetch_cicflow_logs_from_es, export_cicflow_logs_to_pkl
from typing import Optional
from database import get_db

router = APIRouter(tags=["Events"])

@router.get("/events")
def get_events(size: int = Query(500, description="Number of logs to fetch"),
               from_time: Optional[str] = Query(None, description="Fetch logs from this timestamp onwards (ISO format)"),
               orgId: int = Query(..., description="Organization ID to filter logs"),
               db: Session = Depends(get_db)):
    """Get network traffic events from Elasticsearch"""

    return fetch_cicflow_logs_from_es(size=size, from_time=from_time, orgId=orgId, db=db)


@router.get("/events/export/{org_id}")
def export_events(org_id: int, db: Session = Depends(get_db)):
    """Export events to a pickle file"""
    return export_cicflow_logs_to_pkl(org_id, db)
