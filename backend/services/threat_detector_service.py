import joblib
import numpy as np
import os
from database import SessionLocal
from models.models import NetworkLogs, LogPredictions, MLModels
from datetime import datetime, timedelta

# Load the model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../machineLearningModels/voting_classifier_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "../machineLearningModels/scaler.pkl")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

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
        
def predict_threat(log_id: int, organization_id: int):
    """
    Fetch a network log by ID and predict if it's a threat using organization-specific ML models.
    Falls back to default model if no active model is found for the organization.
    """
    with SessionLocal() as db:
        # First check if the log exists
        log = db.query(NetworkLogs).filter(NetworkLogs.id == log_id).first()
        if not log:
            return {"error": f"Log with ID {log_id} not found"}

        # Check for active ML model for the organization
        active_model = db.query(MLModels).filter(
            MLModels.organization_id == organization_id,
            MLModels.is_active == True
        ).first()

        if active_model:
            try:
                # Load the organization's custom model
                custom_model = joblib.load(active_model.model_file_path)
                print("loaded")
                
                # Extract features based on the model's features list
                if active_model.use_default_features:
                    # Use default features
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
                    print("used features")
                else:
                    # Use custom features list
                    feature_names = active_model.features_list.split(',')
                    features = np.array([getattr(log, feature.strip()) for feature in feature_names])
                    # 
                # Handle preprocessing
                if active_model.use_default_preprocessor:
                    features_scaled = scaler.transform(features.reshape(1, -1))
                elif active_model.has_built_in_preprocessor:
                    features_scaled = features.reshape(1, -1)
                else:
                    # Load custom preprocessor
                    custom_preprocessor = joblib.load(active_model.preprocessor_file_path)
                    features_scaled = custom_preprocessor.transform(features.reshape(1, -1))
                
                print("before prediction  ")

                # Make prediction
                prediction = custom_model.predict(features_scaled)
                print("printing model type" + str(active_model.model_type))
                print(active_model.label_mapping)
                
                # Handle prediction mapping
                if active_model.model_type == 'multiclass' and active_model.label_mapping:
                    predicted_type = active_model.label_mapping.get(str(int(prediction[0])), "Unknown")
                else:
                    # For anomaly detection, typically 1 is anomaly, 0 is normal
                    predicted_type = "Anomaly" if prediction[0] == 1 else "Normal"

            except Exception as e:
                print(f"Error using custom model: {str(e)}")
                # Fallback to default model
                return use_default_model(log, log_id, organization_id, db)
        else:
            # No active custom model, use default
            return use_default_model(log, log_id, organization_id, db)
        
        # Store prediction if it's a threat
        if active_model.model_type == 'multiclass' and active_model.label_mapping:
            predicted_type = active_model.label_mapping.get(str(int(prediction[0])), "Unknown")
            # Check against custom normal class name if specified
            is_normal = (predicted_type == active_model.normal_class_name) if active_model.normal_class_name else (predicted_type in ["BENIGN", "Normal"])
        else:
            predicted_type = "Anomaly" if prediction[0] == 1 else "Normal"
            is_normal = predicted_type == "Normal"

        # Store prediction if it's a threat
        if not is_normal:
            new_prediction = LogPredictions(
                log_id=log_id,
                prediction=predicted_type,
                organization_id=organization_id
            )
            db.add(new_prediction)
            db.commit()
            db.refresh(new_prediction)

        return {
            "log_id": log_id,
            "prediction": predicted_type,
            "organization_id": organization_id
        }

def use_default_model(log, log_id, organization_id, db):
    """Helper function to use the default model for prediction"""
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
    features_scaled = scaler.transform(features.reshape(1, -1))
    types = ['BENIGN', 'DDoS', 'PortScan', 'Bot', 'Infiltration',
            'Web Attack Brute Force', 'Web Attack XSS',
            'Web Attack Sql Injection']

    prediction = model.predict(features_scaled)
    predicted_type = types[int(prediction[0]) - 1]

    if predicted_type != "BENIGN":
        new_prediction = LogPredictions(
            log_id=log_id,
            prediction=predicted_type,
            organization_id=organization_id
        )
        db.add(new_prediction)
        db.commit()
        db.refresh(new_prediction)

    return {
        "log_id": log_id,
        "prediction": predicted_type,
        "organization_id": organization_id
    }

# def fetch_predictions(organization_id: int, log_id: int = None):
#     """
#     Fetch predictions filtered by organization_id.
#     Optionally filter by specific log_id as well.
#     """
#     with SessionLocal() as db:
#         query = db.query(LogPredictions).filter(
#             LogPredictions.organization_id == organization_id
#         )
        
#         if log_id:
#             prediction = query.filter(LogPredictions.log_id == log_id).first()
#             if not prediction:
#                 return {"error": f"No prediction found for log ID {log_id} in organization {organization_id}"}
            
#             log = db.query(NetworkLogs).filter(NetworkLogs.id == prediction.log_id).first()
#             return {
#                 "log_id": prediction.log_id,
#                 "prediction": prediction.prediction,
#                 "confidence": prediction.confidence,
#                 "created_at": prediction.created_at,
#                 "organization_id": prediction.organization_id,
#                 "log_details": {
#                     "dst_port": log.dst_port,
#                     "flow_duration": log.flow_duration,
#                     "total_fwd_packets": log.total_fwd_packets,
#                     "total_bwd_packets": log.total_bwd_packets,
#                     "total_length_fwd_packets": log.total_length_fwd_packets,
#                     "total_length_bwd_packets": log.total_length_bwd_packets,
#                     "fwd_packet_length_mean": log.fwd_packet_length_mean,
#                     "bwd_packet_length_mean": log.bwd_packet_length_mean,
#                     "flow_bytes_per_s": log.flow_bytes_per_s,
#                     "flow_packets_per_s": log.flow_packets_per_s,
#                 }
#             }
        
#         # Fetch all predictions for the organization
#         predictions = query.all()
#         results = []
#         for pred in predictions:
#             log = db.query(NetworkLogs).filter(NetworkLogs.id == pred.log_id).first()
#             results.append({
#                 "log_id": pred.log_id,
#                 "prediction": pred.prediction,
#                 "confidence": pred.confidence,
#                 "created_at": pred.created_at,
#                 "organization_id": pred.organization_id,
#                 "log_details": {
#                     "dst_port": log.dst_port,
#                     "flow_duration": log.flow_duration,
#                     "total_fwd_packets": log.total_fwd_packets,
#                     "total_bwd_packets": log.total_bwd_packets,
#                     "total_length_fwd_packets": log.total_length_fwd_packets,
#                     "total_length_bwd_packets": log.total_length_bwd_packets,
#                     "fwd_packet_length_mean": log.fwd_packet_length_mean,
#                     "bwd_packet_length_mean": log.bwd_packet_length_mean,
#                     "flow_bytes_per_s": log.flow_bytes_per_s,
#                     "flow_packets_per_s": log.flow_packets_per_s,
#                 }
#             })
#         return results
    

def clean_float_for_json(value):
    """Helper function to clean float values for JSON serialization"""
    if isinstance(value, float):
        if value in (float('inf'), float('-inf')) or value != value:  # Check for inf and NaN
            return None
    return value

def fetch_predictions(organization_id: int, log_id: int = None):
    """
    Fetch predictions filtered by organization_id with clean float values.
    """
    with SessionLocal() as db:
        query = db.query(LogPredictions).filter(
            LogPredictions.organization_id == organization_id
        )
        
        if log_id:
            prediction = query.filter(LogPredictions.log_id == log_id).first()
            if not prediction:
                return {"error": f"No prediction found for log ID {log_id} in organization {organization_id}"}
            
            log = db.query(NetworkLogs).filter(NetworkLogs.id == prediction.log_id).first()
            return {
                "log_id": prediction.log_id,
                "prediction": prediction.prediction,
                "confidence": clean_float_for_json(prediction.confidence),
                "created_at": prediction.created_at,
                "organization_id": prediction.organization_id,
                "log_details": {
                    "dst_port": log.dst_port,
                    "flow_duration": clean_float_for_json(log.flow_duration),
                    "total_fwd_packets": log.total_fwd_packets,
                    "total_bwd_packets": log.total_bwd_packets,
                    "total_length_fwd_packets": clean_float_for_json(log.total_length_fwd_packets),
                    "total_length_bwd_packets": clean_float_for_json(log.total_length_bwd_packets),
                    "fwd_packet_length_mean": clean_float_for_json(log.fwd_packet_length_mean),
                    "bwd_packet_length_mean": clean_float_for_json(log.bwd_packet_length_mean),
                    "flow_bytes_per_s": clean_float_for_json(log.flow_bytes_per_s),
                    "flow_packets_per_s": clean_float_for_json(log.flow_packets_per_s)
                }
            }
        
        # Fetch all predictions for the organization
        predictions = query.all()
        results = []
        for pred in predictions:
            log = db.query(NetworkLogs).filter(NetworkLogs.id == pred.log_id).first()
            if log:  # Only include if log exists
                results.append({
                    "log_id": pred.log_id,
                    "prediction": pred.prediction,
                    "confidence": clean_float_for_json(pred.confidence),
                    "created_at": pred.created_at,
                    "organization_id": pred.organization_id,
                    "log_details": {
                        "dst_port": log.dst_port,
                        "flow_duration": clean_float_for_json(log.flow_duration),
                        "total_fwd_packets": log.total_fwd_packets,
                        "total_bwd_packets": log.total_bwd_packets,
                        "total_length_fwd_packets": clean_float_for_json(log.total_length_fwd_packets),
                        "total_length_bwd_packets": clean_float_for_json(log.total_length_bwd_packets),
                        "fwd_packet_length_mean": clean_float_for_json(log.fwd_packet_length_mean),
                        "bwd_packet_length_mean": clean_float_for_json(log.bwd_packet_length_mean),
                        "flow_bytes_per_s": clean_float_for_json(log.flow_bytes_per_s),
                        "flow_packets_per_s": clean_float_for_json(log.flow_packets_per_s)
                    }
                })
        return results
    
def predict_recent_logs():
    """
    Predict threats for all logs from the last 5 minutes for all organizations.
    Returns a summary of predictions made.
    """
    with SessionLocal() as db:
        now = datetime.utcnow()
        five_minutes_ago = now - timedelta(minutes=500)
        # Fetch logs from the last 5 minutes
        recent_logs = db.query(NetworkLogs).filter(NetworkLogs.timestamp >= five_minutes_ago).all()
        recent_logs = db.query(NetworkLogs).all()
        results = []
        for log in recent_logs:
            # Try to get organization_id from log if available, else default to 1 or skip
            organization_id = getattr(log, "organization_id", None)
            if not organization_id:
                continue  # Skip logs without organization_id
            result = predict_threat(log.id, organization_id)
            results.append(result)
        return results