import joblib
import numpy as np
import os
from database import SessionLocal
from models.models import NetworkLogs

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

        print(f"Features extracted for prediction: {features}")  # Log the extracted features

        type = [ 'BENIGN', 'DDoS', 'PortScan', 'Bot', 'Infiltration',
       'Web Attack � Brute Force', 'Web Attack � XSS',
       'Web Attack � Sql Injection']
        # Predict
        prediction = model.predict(features_scaled)
        print(f"Prediction result: {prediction}")  # Log the prediction result
        return {"log_id": log_id, "prediction": type[int(prediction[0]) - 1]}
