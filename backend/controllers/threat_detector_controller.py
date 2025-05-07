from fastapi import APIRouter, HTTPException, Body
from typing import List
from services.threat_detector_service import predict_threat

router = APIRouter()

@router.post("/threat/predict/batch")
def predict_threat_batch(payload: dict = Body(...)):
    """
    Predict if multiple network logs are threats based on their IDs.
    """
    log_ids = payload.get("log_ids", [])
    if not isinstance(log_ids, list) or not all(isinstance(id, int) for id in log_ids):
        raise HTTPException(
            status_code=400, 
            detail="Invalid input: 'log_ids' must be a list of integers."
        )
    results = []
    for log_id in log_ids:
        print('before predict_threat_endpoint')
        result = predict_threat(log_id)
        if "error" in result:
            print('error in predict_threat_endpoint')
            print(f"Error: {result['error']}")
            raise HTTPException(
                status_code=403, 
                detail=f"Log ID {log_id} failed with error: {result['error']}"
            )
        results.append(result)
    return results
