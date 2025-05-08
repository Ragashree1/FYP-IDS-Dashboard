from fastapi import APIRouter, HTTPException, Body
from typing import List
from services.threat_detector_service import predict_threat, fetch_predictions

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

#TODO remove this endpoint after grouping by organisation id is dont
@router.get("/threat/predictions")
def get_all_predictions():
    """
    Fetch all predictions from the LogPredictions table.
    """
    print('yay')
    predictions = fetch_predictions()
    if isinstance(predictions, dict) and "error" in predictions:
        raise HTTPException(status_code=404, detail=predictions["error"])
    return predictions

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