import requests
from datetime import datetime
from database import SessionLocal
from models.models import SnortAlerts
import logging
import json
from models.models import VerifiedIP
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

def fetch_alerts(orgId: int):
    es_url = "http://localhost:9200/sno+" \
    "rt-logs-*/_search"
    query = {
        "size": 50,  # Limit to 50 results
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    
    headers = {"Content-Type": "application/json"}
    try:
        logger.info(f"Fetching alerts from Elasticsearch for organization {orgId}")
        response = requests.get(es_url, json=query, headers=headers, timeout=10)  # Add timeout
        if response.status_code != 200:
            logger.error(f"Elasticsearch returned status code {response.status_code}: {response.text}")
            return []
            
        alerts = response.json().get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} alerts from Elasticsearch")
        return verify_logs(alerts, orgId)
    except requests.exceptions.Timeout:
        logger.error("Elasticsearch request timed out")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to Elasticsearch: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_alerts: {str(e)}")
        return []

def verify_logs(logs: list, orgId: int): 
    verified_logs = []
    verified_logs_count = 0

    with SessionLocal() as db:
        for hit in logs:
            source = hit.get("_source", {})

            ip_list = source.get("host", {}).get("ip", [])
            ip = next((addr for addr in ip_list if ":" not in addr), None)
            if not ip: 
                continue

            verified = db.query(VerifiedIP).filter_by(ip=ip, organization_id=orgId, is_verified=True).first()
            if verified:
                verified_logs.append(hit)
                verified_logs_count += 1
            else:
                logger.warning(f"IP '{ip}' is not verified for organization {orgId}. Log entry rejected.")

        logger.info(f"Returning {verified_logs_count} verified logs for organization {orgId}")
        return verified_logs

def get_last_alert_time():
    with SessionLocal() as db:
        last_alert = db.query(SnortAlerts).order_by(SnortAlerts.timestamp.desc()).first()
        return datetime.strptime(last_alert.timestamp, "%Y-%m-%dT%H:%M:%S.%fZ") if last_alert else None

def preprocess_alert(alert, orgId: int):
    try:
        message_parts = alert['_source']['message'].split(',')
        timestamp = alert['_source']['@timestamp']
        if len(message_parts) < 12:
            raise ValueError("Alert format is incorrect")
        return {
            "timestamp": timestamp,
            "priority": int(message_parts[1].strip()),
            "protocol": message_parts[2].strip(),
            "raw": message_parts[3].strip(),
            "length": int(message_parts[4].strip()),
            "direction": message_parts[5].strip(),
            "src_ip": message_parts[6].split(':')[0].strip(),
            "src_port": int(message_parts[6].split(':')[1].strip()),
            "dest_ip": message_parts[7].split(':')[0].strip(),
            "dest_port": int(message_parts[7].split(':')[1].strip()),
            "signature_id": message_parts[8].strip(),
            "action": message_parts[9].strip(),
            "message": message_parts[10].strip().replace('"', ''),
            "classification": message_parts[11].strip(),
            "host": alert['_source']['host']['ip'][0],
            "alert_source": "snort",  # Add alert_source
            "organization_id": orgId  # Add organization_id
        }
    except (IndexError, ValueError, KeyError) as e:
        logger.error(f"Error processing alert: {str(e)}")
        logger.debug(f"Alert data: {json.dumps(alert)}")
        return None

def save_alerts(alerts, orgId: int):
    with SessionLocal() as db:
        saved_count = 0
        for alert in alerts:
            preprocessed_alert = preprocess_alert(alert, orgId)  # Pass orgId
            if preprocessed_alert:
                db_alert = SnortAlerts(**preprocessed_alert)
                db.add(db_alert)
                saved_count += 1
        db.commit()
        logger.info(f"Saved {saved_count} alerts to database for organization {orgId}")

def update_and_fetch_alerts(orgId: int):
    try:
        logger.info(f"Updating and fetching alerts for organization {orgId}")
        last_alert_time = get_last_alert_time()
        alerts = fetch_alerts(orgId)
        
        new_alerts = []
        for alert in alerts:
            try:
                alert_time = datetime.strptime(alert['_source']['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
                if not last_alert_time or alert_time > last_alert_time:
                    new_alerts.append(alert)
            except Exception as e:
                logger.error(f"Error processing alert timestamp: {str(e)}")
        
        logger.info(f"Found {len(new_alerts)} new alerts for organization {orgId}")
        
        # Pass the organization ID when saving alerts
        save_alerts(new_alerts, orgId)
        
        # Only return alerts for this organization
        with SessionLocal() as db:
            org_alerts = db.query(SnortAlerts).filter(SnortAlerts.organization_id == orgId).all()
            logger.info(f"Returning {len(org_alerts)} alerts from database for organization {orgId}")
            return org_alerts
    except Exception as e:
        logger.error(f"Error in update_and_fetch_alerts: {str(e)}")
        return []