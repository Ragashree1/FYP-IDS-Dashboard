from fastapi import APIRouter, UploadFile, File, Query
from typing import Optional
from services import log_service

router = APIRouter(tags=["Logs"])

@router.get("/logs")
def get_logs():
    logs = log_service.update_and_fetch_logs()
    return logs if isinstance(logs, list) else []  # Ensure logs is a list

@router.post("/logs/upload")
async def upload_csv(file: UploadFile = File(...)):
    return log_service.process_csv_file(file)

@router.get("/logs/networkLogs")
def get_network_logs(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1)):
    result = log_service.get_paginated_network_logs(page, page_size)
    return result  # Return the serialized result directly


@router.get("/events")
def get_events(orgId: int = Query(...)):
    """Get network traffic events from the DB"""
    return log_service.get_logs_from_db(orgId)

@router.get("/export")
def export_events(orgId: int = Query(...)):
    """Export network traffic events to CSV"""
    return log_service.export_cicflow_logs_to_csv(orgId)