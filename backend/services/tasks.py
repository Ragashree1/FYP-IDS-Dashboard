from celery import Celery
from services.threat_detector_service import predict_threat

celery_app = Celery(
    "threat_detection",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task
def detect_threat_task(log_id, organization_id):
    return predict_threat(log_id, organization_id)