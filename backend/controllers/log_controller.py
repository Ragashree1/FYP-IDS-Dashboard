from fastapi import APIRouter, UploadFile, File, Query
from services import log_service
from services.log_service import update_and_fetch_logs, process_csv_file
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

