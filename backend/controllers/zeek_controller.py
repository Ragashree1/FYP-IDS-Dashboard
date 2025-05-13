from fastapi import APIRouter, HTTPException
from services.zeek_service import update_and_fetch_zeek_alerts, force_import_alerts, get_elasticsearch_alert_count_by_note
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Important: Change this line to specify the prefix as empty
# This allows your routes to be at the root level
router = APIRouter()

@router.get("/zeek_alerts/{orgId}")
def get_zeek_alerts(orgId: int):
    """
    Get alerts from Zeek only, filtered by organization ID
    """
    try:
        alerts = update_and_fetch_zeek_alerts(orgId)
        logger.info(f"Returning {len(alerts)} Zeek alerts for organization {orgId}")
        return alerts
    except Exception as e:
        logger.error(f"Error in get_zeek_alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/force_import_zeek_alerts/{orgId}")
def force_import_zeek_alerts(orgId: int, limit: int = 100):
    """
    Force import Zeek alerts from Elasticsearch to the database
    """
    try:
        result = force_import_alerts(orgId, limit)
        if result:
            return {"status": "success", "message": f"Alerts imported successfully for organization {orgId}"}
        else:
            return {"status": "warning", "message": "No alerts found to import"}
    except Exception as e:
        logger.error(f"Error in force_import_zeek_alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Add this new endpoint to match what your dashboard is expecting
@router.get("/zeek/alerts")
def get_alerts(orgId: int = None):
    """
    Get alerts for a specific organization (for dashboard compatibility)
    """
    if not orgId:
        raise HTTPException(status_code=400, detail="Organization ID is required")
    
    try:
        # Use your existing function to get alerts
        alerts = update_and_fetch_zeek_alerts(orgId)
        
        # If alerts is None or empty, return an empty list
        if not alerts:
            return []
        
        logger.info(f"Returning {len(alerts)} alerts for organization {orgId}")
        return alerts
    except Exception as e:
        logger.error(f"Error in get_alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/zeek_alert_stats")
def get_zeek_alert_statistics():
    """
    Get statistics about Zeek alerts grouped by attack type
    """
    try:
        stats = get_elasticsearch_alert_count_by_note()
        return {"status": "success", "count": stats}
    except Exception as e:
        logger.error(f"Error in get_zeek_alert_statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")