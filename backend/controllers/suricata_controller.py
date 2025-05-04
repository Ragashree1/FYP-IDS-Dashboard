from fastapi import APIRouter, HTTPException
from services.suricata_service import update_and_fetch_suricata_alerts, force_import_alerts
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Important: Change this line to specify the prefix as empty
# This allows your routes to be at the root level
router = APIRouter()

@router.get("/suricata_alerts/{orgId}")
def get_suricata_alerts(orgId: int):
    """
    Get alerts from Suricata only, filtered by organization ID
    """
    try:
        alerts = update_and_fetch_suricata_alerts(orgId)
        logger.info(f"Returning {len(alerts)} Suricata alerts for organization {orgId}")
        return alerts
    except Exception as e:
        logger.error(f"Error in get_suricata_alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/force_import_suricata_alerts/{orgId}")
def force_import_suricata_alerts(orgId: int, limit: int = 100):
    """
    Force import Suricata alerts from Elasticsearch to the database
    """
    try:
        result = force_import_alerts(orgId, limit)
        if result:
            return {"status": "success", "message": f"Alerts imported successfully for organization {orgId}"}
        else:
            return {"status": "warning", "message": "No alerts found to import"}
    except Exception as e:
        logger.error(f"Error in force_import_suricata_alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Add this new endpoint to match what your dashboard is expecting
@router.get("/alerts")
def get_alerts(orgId: int = None):
    """
    Get alerts for a specific organization (for dashboard compatibility)
    """
    if not orgId:
        raise HTTPException(status_code=400, detail="Organization ID is required")
    
    try:
        # Use your existing function to get alerts
        alerts = update_and_fetch_suricata_alerts(orgId)
        
        # If alerts is None or empty, return an empty list
        if not alerts:
            return []
        
        logger.info(f"Returning {len(alerts)} alerts for organization {orgId}")
        return alerts
    except Exception as e:
        logger.error(f"Error in get_alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")