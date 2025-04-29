import requests
from datetime import datetime
from database import SessionLocal
from models.models import SnortAlerts
from apscheduler.schedulers.background import BackgroundScheduler

def fetch_alerts():
    es_url = "http://localhost:9200/snort-logs-*/_search"
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.get(es_url, json=query, headers=headers)
    alerts = response.json().get('hits', {}).get('hits', [])
    
    return alerts

def get_last_alert_time():
    with SessionLocal() as db:
        last_alert = db.query(SnortAlerts).order_by(SnortAlerts.timestamp.desc()).first()
        return datetime.strptime(last_alert.timestamp, "%Y-%m-%dT%H:%M:%S.%fZ") if last_alert else None

def preprocess_alert(alert):
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
            "host": alert['_source']['host']['ip'][0]
        }
    except (IndexError, ValueError, KeyError) as e:
        print(f"Skipping alert due to error: {e}")
        return None

def save_alerts(alerts):
    with SessionLocal() as db:
        for alerts in alerts:
            preprocessed_alert = preprocess_alert(alerts)
            if preprocessed_alert:
                db_alert = SnortAlerts(**preprocessed_alert)
                db.add(db_alert)
        db.commit()

def update_and_fetch_alerts():
    last_alert_time = get_last_alert_time()
    alerts = fetch_alerts()
    
    new_alerts = []
    for alert in alerts:
        alert_time = datetime.strptime(alert['_source']['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
        if not last_alert_time or alert_time > last_alert_time:
            new_alerts.append(alert)
    
    save_alerts(new_alerts)
    
    with SessionLocal() as db:
        return db.query(SnortAlerts).all()
