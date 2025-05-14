from fastapi import APIRouter, HTTPException, Body, Query
from typing import List
from services.threat_detector_service import predict_threat, fetch_predictions,delete_prediction

router = APIRouter()

@router.delete("/threat/prediction/{prediction_id}")
def delete_prediction_by_id(prediction_id: int):
    """
    Delete a prediction by its prediction ID.
    """
    deleted = delete_prediction(prediction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {"message": "Prediction deleted"}
@router.post("/threat/predict/batch")
def predict_threat_batch(payload: dict = Body(...)):
    """
    Predict threats for multiple logs within an organization.
    """
    log_ids = payload.get("log_ids", [])
    organization_id = payload.get("organization_id")
    
    if not organization_id:
        raise HTTPException(
            status_code=400,
            detail="organization_id is required"
        )
    
    if not isinstance(log_ids, list) or not all(isinstance(id, int) for id in log_ids):
        raise HTTPException(
            status_code=400,
            detail="Invalid input: 'log_ids' must be a list of integers"
        )
    
    results = []
    for log_id in log_ids:
        result = predict_threat(log_id, organization_id)
        if "error" in result:
            raise HTTPException(
                status_code=404,
                detail=f"Log ID {log_id} failed with error: {result['error']}"
            )
        results.append(result)
    return results
#TODO remove this endpoint after grouping by organisation id is done
@router.get("/threat/predictions/organization/{organization_id}")
def get_organization_predictions(
    organization_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Fetch paginated predictions for a specific organization.
    """
    predictions = fetch_predictions(
        organization_id=organization_id,
        page=page,
        limit=limit
    )
    if isinstance(predictions, dict) and "error" in predictions:
        raise HTTPException(status_code=404, detail=predictions["error"])
    return predictions

@router.get("/threat/predictions/organization/{organization_id}/log/{log_id}")
def get_prediction_by_log_id(organization_id: int, log_id: int):
    """
    Fetch a specific prediction by log ID and organization ID.
    """
    prediction = fetch_predictions(organization_id=organization_id, log_id=log_id)
    if isinstance(prediction, dict) and "error" in prediction:
        raise HTTPException(status_code=404, detail=prediction["error"])
    return prediction

#TODO change logid to organisation id

# @router.get("/threat/predictions/{log_id}")
# def get_prediction_by_log_id(log_id: int):
#     """
#     Fetch a specific prediction by log ID from the LogPredictions table.
#     """
#     prediction = fetch_predictions(log_id=log_id)
#     if isinstance(prediction, dict) and "error" in prediction:
#         raise HTTPException(status_code=404, detail=prediction["error"])
#     return prediction