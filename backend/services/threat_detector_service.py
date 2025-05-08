import joblib
import numpy as np
import os
from database import SessionLocal
from models.models import NetworkLogs, LogPredictions

# Load the model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../machineLearningModels/voting_classifier_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "../machineLearningModels/scaler.pkl")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
def predict_threat(log_id: int):
    """
    Fetch a network log by ID, extract features, and predict if it's a threat.
    """
    with SessionLocal() as db:
        print(f"Fetching log with ID: {log_id}")  # Log the log_id being queried
        log = db.query(NetworkLogs).filter(NetworkLogs.id == log_id).first()
        if not log:
            print(f"Log with ID {log_id} not found in the database")  # Log if the log is not found
            return {"error": f"Log with ID {log_id} not found"}

        print(f"Log found: {log}")  # Log the retrieved log object

        # Extract features in the required order
        features = np.array([
            log.bwd_packet_length_std,
            log.psh_flag_count,
            log.min_seg_size_forward,
            log.min_packet_length,
            log.ack_flag_count,
            log.bwd_packet_length_min,
            log.fwd_iat_std,
            log.init_win_bytes_forward,
            log.flow_iat_max,
            log.bwd_packets_per_s,
            log.urg_flag_count,
            log.bwd_iat_total
        ])
        features_scaled = scaler.transform(np.array(features).reshape(1, -1))
        types = [ 'BENIGN', 'DDoS', 'PortScan', 'Bot', 'Infiltration',
       'Web Attack � Brute Force', 'Web Attack � XSS',
       'Web Attack � Sql Injection']

        # Predict
        prediction = model.predict(features_scaled)
        # confidence = model.predict_proba(features_scaled).max()  # Get the confidence score
        predicted_type = types[int(prediction[0]) - 1]

        print(f"Prediction result: {predicted_type}")  # Log the prediction result

        if predicted_type == 'BENIGN':
            print("No threat detected.")
        else:
            new_prediction = LogPredictions(
                log_id=log_id,
                prediction=predicted_type,
                # confidence=confidence
            )
            db.add(new_prediction)
            db.commit()
            db.refresh(new_prediction)

        return {"log_id": log_id, "prediction": predicted_type}

# #TODO change log id to organisation id
# def fetch_predictions(log_id: int = None):
#     """
#     Fetch predictions from the LogPredictions table.
#     If log_id is provided, fetch predictions for that specific log.
#     """
#     with SessionLocal() as db:
#         if log_id:
#             # Fetch predictions for a specific log ID
#             prediction = db.query(LogPredictions).filter(LogPredictions.log_id == log_id).first()
#             if not prediction:
#                 return {"error": f"No prediction found for log ID {log_id}"}
#             return {
#                 "log_id": prediction.log_id,
#                 "prediction": prediction.prediction,
#                 "confidence": prediction.confidence,
#                 "created_at": prediction.created_at
#             }
#         else:
#             # Fetch all predictions
#             predictions = db.query(LogPredictions).all()
#             return [
#                 {
#                     "log_id": pred.log_id,
#                     "prediction": pred.prediction,
#                     "confidence": pred.confidence,
#                     "created_at": pred.created_at
#                 }
#                 for pred in predictions
#             ]
        
def fetch_predictions(log_id: int = None):
    """
    Fetch predictions from the LogPredictions table.
    If log_id is provided, fetch predictions for that specific log.
    Include log details in the response.
    """
    with SessionLocal() as db:
        if log_id:
            # Fetch predictions for a specific log ID
            prediction = db.query(LogPredictions).filter(LogPredictions.log_id == log_id).first()
            if not prediction:
                return {"error": f"No prediction found for log ID {log_id}"}
            log = db.query(NetworkLogs).filter(NetworkLogs.id == prediction.log_id).first()
            return {
                "log_id": prediction.log_id,
                "prediction": prediction.prediction,
                "confidence": prediction.confidence,
                "created_at": prediction.created_at,
                "log_details": {
                    "dstport": log.dstport,
                    "flow_duration": log.flow_duration,
                    "total_fwd_packets": log.total_fwd_packets,
                    "total_bwd_packets": log.total_bwd_packets,
                    "total_length_fwd_packets": log.total_length_fwd_packets,
                    "total_length_bwd_packets": log.total_length_bwd_packets,
                    "fwd_packet_length_mean": log.fwd_packet_length_mean,
                    "bwd_packet_length_mean": log.bwd_packet_length_mean,
                    "flow_bytes_per_s": log.flow_bytes_per_s,
                    "flow_packets_per_s": log.flow_packets_per_s,
                }
            }
        else:
            # Fetch all predictions
            predictions = db.query(LogPredictions).all()
            results = []
            for pred in predictions:
                log = db.query(NetworkLogs).filter(NetworkLogs.id == pred.log_id).first()
                results.append({
                    "log_id": pred.log_id,
                    "prediction": pred.prediction,
                    "confidence": pred.confidence,
                    "created_at": pred.created_at,
                    "log_details": {
                        "dstport": log.dstport,
                        "flow_duration": log.flow_duration,
                        "total_fwd_packets": log.total_fwd_packets,
                        "total_bwd_packets": log.total_bwd_packets,
                        "total_length_fwd_packets": log.total_length_fwd_packets,
                        "total_length_bwd_packets": log.total_length_bwd_packets,
                        "fwd_packet_length_mean": log.fwd_packet_length_mean,
                        "bwd_packet_length_mean": log.bwd_packet_length_mean,
                        "flow_bytes_per_s": log.flow_bytes_per_s,
                        "flow_packets_per_s": log.flow_packets_per_s,
                    }
                })
            return results