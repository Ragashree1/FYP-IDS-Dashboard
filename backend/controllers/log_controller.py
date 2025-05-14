from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Body
from typing import Optional, List
from services import log_service
from models.schemas import LogIdsRequest

router = APIRouter(tags=["Logs"])

@router.get("/logs")
def get_logs():
    logs = log_service.update_and_fetch_logs()
    return logs if isinstance(logs, list) else []  # Ensure logs is a list

@router.post("/logs/upload")
async def upload_csv(file: UploadFile = File(...), orgId: int = Query(...)):
    return log_service.process_csv_file(file, orgId)

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

@router.get("/event/{log_id}")
def get_event_by_id(log_id: int, orgId: int = Query(...)):
    """Get a single network log by its ID and orgId"""
    log = log_service.get_log_by_id(log_id, orgId)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@router.delete("/logs/networkLogs/{log_id}")
def delete_network_log(log_id: int):
    """Delete a single network log by ID"""
    from services import log_service
    deleted = log_service.delete_network_log(log_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"message": "Log deleted"}

@router.delete("/logs/networkLogs/batch")
def delete_network_logs_batch(request: LogIdsRequest = Body(...)):
    """Delete multiple network logs by IDs"""
    # Pydantic will automatically validate the request body against LogIdsRequest.
    # If 'log_ids' is missing or not a list of integers, FastAPI will return a 422 error.
    # An empty list (e.g., {"log_ids": []}) is considered valid by Pydantic for List[int].
    deleted_count = log_service.delete_network_logs_batch(request.log_ids)
    return {"message": f"Deleted {deleted_count} logs"}