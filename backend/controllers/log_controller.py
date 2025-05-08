from fastapi import APIRouter, UploadFile, File, Query
from typing import Optional
from services import log_service
from services.log_service import update_and_fetch_logs, process_csv_file, fetch_cicflow_logs_from_es
import math  # Add this import for checking NaN and infinity

router = APIRouter()

@router.get("/logs")
def get_logs():
    logs = update_and_fetch_logs()
    return logs if isinstance(logs, list) else []  # Ensure logs is a list

@router.post("/logs/upload")
async def upload_csv(file: UploadFile = File(...)):
    return process_csv_file(file)

@router.get("/logs/networkLogs")
def get_network_logs(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1)):
    result = log_service.get_paginated_network_logs(page, page_size)
    return result  # Return the serialized result directly


#newly added part
@router.get("/events")
def get_events(size: int = Query(500, description="Number of logs to fetch"),
               from_time: Optional[str] = Query(None, description="Fetch logs from this timestamp onwards (ISO format)"),
               orgId: int = Query(..., description="Organization ID to filter logs")):
    """Get network traffic events from Elasticsearch"""

    return fetch_cicflow_logs_from_es(size=size, from_time=from_time, orgId=orgId)

