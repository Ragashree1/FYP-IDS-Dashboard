import requests
from datetime import datetime
from database import SessionLocal
from models.models import Logs
from apscheduler.schedulers.background import BackgroundScheduler

def fetch_logs():
    es_url = "http://localhost:9200/apache-*/_search"
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
        last_log = db.query(Logs).order_by(Logs.timestamp.desc()).first()
        return last_log.timestamp if last_log else None

def preprocess_log(log):
    try:
        source = log['_source']
        return {
            "timestamp": source['@timestamp'],
            "log_type": source['fields']['log_type'],
            "source_ip": source['source']['address'],
            "host": source['host']['ip'][0],
            "message": source['message'],
            "event_data": {
                "original": source['event']['original'],
                "os": source['host']['os'],
                "hostname": source['host']['hostname']
            },
            "http_method": source['http']['request']['method'],
            "http_status": source['http']['response']['status_code'],
            "url": source['url']['original'],
            "user_agent": source['user_agent']['original'],
            "log_path": source['log']['file']['path']
        }
    except (KeyError, IndexError) as e:
        print(f"Skipping log due to error: {e}")
        return None

def save_logs(logs):
    print('bef save logs')
    with SessionLocal() as db:
        for log in logs:
            preprocessed_log = preprocess_log(log)
            if preprocessed_log:
                db_log = Logs(**preprocessed_log)
                db.add(db_log)
        db.commit()

def update_and_fetch_logs():
    print('bef update and fetch logs')
    last_log_time = get_last_log_time()
    logs = fetch_logs()
    
    new_logs = []
    for log in logs:
        log_time = datetime.strptime(log['_source']['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
        if not last_log_time or log_time > last_log_time:
            new_logs.append(log)
    
    save_logs(new_logs)
    
    with SessionLocal() as db:
        return db.query(Logs).all()
