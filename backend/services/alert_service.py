import requests
from datetime import datetime
from database import SessionLocal
from models.models import SnortAlerts, VerifiedIP
from apscheduler.schedulers.background import BackgroundScheduler

def fetch_verified_ips():
    """
    Fetch all verified IPs and their organization_id from the database.
    Returns a dict: {ip: organization_id}
    """
    with SessionLocal() as db:
        verified = db.query(VerifiedIP).filter(VerifiedIP.is_verified == True).all()
        return {v.ip: v.organization_id for v in verified}

def parse_timestamp(timestamp_str):
    """
    Parse a timestamp string into a datetime object, supporting multiple formats.
    """
    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",  # ISO 8601 with milliseconds and 'Z'
        "%Y-%m-%dT%H:%M:%S.%f",   # ISO 8601 with milliseconds
        "%Y-%m-%d %H:%M:%S.%f",   # Datetime with space and milliseconds
        "%Y-%m-%dT%H:%M:%S",      # ISO 8601 without milliseconds
        "%Y-%m-%d %H:%M:%S",      # Datetime with space and no milliseconds
    ]
    for fmt in formats:
        try:
            return datetime.strptime(timestamp_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Timestamp '{timestamp_str}' does not match any supported formats.")

def fetch_alerts():
    print("Starting fetch_alerts...")  # Debug print
    es_url = "http://localhost:9200/snort-logs-*/_search"
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.get(es_url, json=query, headers=headers)
        print(f"Elasticsearch response status: {response.status_code}")  # Debug print
        alerts = response.json().get('hits', {}).get('hits', [])
        print(f"Found {len(alerts)} alerts")  # Debug print
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {e}")  # Debug print
        return []

def get_last_alert_time():
    with SessionLocal() as db:
        last_alert = db.query(SnortAlerts).order_by(SnortAlerts.timestamp.desc()).first()
        return last_alert.timestamp if last_alert else None

def preprocess_alert(alert):
    try:
        print("Raw Alert:", alert)
        message_parts = alert['_source']['message'].split(',')
        timestamp_str = alert['_source']['@timestamp']
        # Convert timestamp string to datetime object
        try:
            timestamp = parse_timestamp(timestamp_str)
        except Exception as e:
            print(f"Failed to parse timestamp: {timestamp_str} ({e})")
            return None
        if len(message_parts) < 12:
            raise ValueError("Alert format is incorrect")
        return {
            "timestamp": timestamp,  # Now a datetime object
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
            "host": alert['_source']['host']['ip'][0]
        }
    except (IndexError, ValueError, KeyError) as e:
        print(f"Skipping alert due to error: {e}")
        return None

def get_client_ip_and_org(preprocessed_alert, verified_ip_map):
    """
    If either src_ip or dest_ip is in verified_ip_map, return (ip, organization_id).
    Returns (None, None) if neither is verified.
    """
    src_ip = preprocessed_alert.get("src_ip")
    dest_ip = preprocessed_alert.get("dest_ip")
    if src_ip in verified_ip_map:
        return src_ip, verified_ip_map[src_ip]
    if dest_ip in verified_ip_map:
        return dest_ip, verified_ip_map[dest_ip]
    return None, None

def save_alerts(alerts):
    verified_ip_map = fetch_verified_ips()
    with SessionLocal() as db:
        for alert in alerts:
            preprocessed_alert = preprocess_alert(alert)
            if preprocessed_alert:
                client_ip, org_id = get_client_ip_and_org(preprocessed_alert, verified_ip_map)
                if org_id:
                    print("Saving Alert:", preprocessed_alert)  # Debug print
                    preprocessed_alert["organization_id"] = org_id
                    db_alert = SnortAlerts(**preprocessed_alert)
                    db.add(db_alert)
        try:
            db.commit()
        except Exception as e:
            print(f"Error during db.commit(): {e}")
            db.rollback()

def update_and_fetch_alerts():
    print("Starting update_and_fetch_alerts...")  # Debug print
    try:
        last_alert_time = get_last_alert_time()
        print(f"Last alert time: {last_alert_time}")  # Debug print

        # Only parse if last_alert_time is a string
        if last_alert_time and isinstance(last_alert_time, str):
            last_alert_time = parse_timestamp(last_alert_time)
            print(f"Parsed last alert time: {last_alert_time}")  # Debug print

        alerts = fetch_alerts()
        print(f"Fetched {len(alerts)} alerts")  # Debug print

        new_alerts = []
        for alert in alerts:
            try:
                alert_time = datetime.strptime(alert['_source']['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
                if not last_alert_time or alert_time > last_alert_time:
                    new_alerts.append(alert)
            except Exception as e:
                print(f"Error processing alert: {e}")  # Debug print
                continue

        print(f"Found {len(new_alerts)} new alerts")  # Debug print
        if new_alerts:
            save_alerts(new_alerts)

        with SessionLocal() as db:
            all_alerts = db.query(SnortAlerts).all()
            print(f"Total alerts in database: {len(all_alerts)}")  # Debug print
            return all_alerts
    except Exception as e:
        print(f"Error in update_and_fetch_alerts: {e}")  # Debug print
        return []

def fetch_alerts_by_org(organization_id: int):
    """
    Fetch alerts from SnortAlerts table for a specific organization.
    """
    with SessionLocal() as db:
        return db.query(SnortAlerts).filter(SnortAlerts.organization_id == organization_id).all()