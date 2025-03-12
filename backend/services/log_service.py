import requests
from datetime import datetime
from database import SessionLocal
from models.models import SnortLogs

def fetch_logs():
    es_url = "http://localhost:9200/snort-logs-*/_search"
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.get(es_url, json=query, headers=headers)
    logs = response.json().get('hits', {}).get('hits', [])
    
    return logs

def get_last_log_time():
    with SessionLocal() as db:
        last_log = db.query(SnortLogs).order_by(SnortLogs.timestamp.desc()).first()
        return datetime.strptime(last_log.timestamp, "%Y-%m-%dT%H:%M:%S.%fZ") if last_log else None

def preprocess_log(log):
    message_parts = log['_source']['message'].split(',')
    timestamp = log['_source']['@timestamp']
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
        "classification": message_parts[8].strip(),
        "action": message_parts[9].strip(),
        "message": message_parts[10].strip(),
        "description": message_parts[11].strip(),
        "host": log['_source']['host']['ip'][0]
    }

def save_logs(logs):
    with SessionLocal() as db:
        for log in logs:
            preprocessed_log = preprocess_log(log)
            db_log = SnortLogs(**preprocessed_log)
            db.add(db_log)
        db.commit()

def update_and_fetch_logs():
    last_log_time = get_last_log_time()
    logs = fetch_logs()
    
    new_logs = []
    for log in logs:
        log_time = datetime.strptime(log['_source']['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
        if not last_log_time or log_time > last_log_time:
            new_logs.append(log)
    
    save_logs(new_logs)
    
    with SessionLocal() as db:
        return db.query(SnortLogs).all()
