import requests
from datetime import datetime
from database import SessionLocal
from models.models import Logs
from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger(__name__)

ES_URL = "http://localhost:9200/apache-*/_search"

def fetch_logs_from_elasticsearch():
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.get(ES_URL, json=query, headers=headers)
        response.raise_for_status()
        return response.json().get('hits', {}).get('hits', [])
    except requests.RequestException as e:
        logger.error(f"Error fetching logs from Elasticsearch: {e}")
        return []

def get_latest_timestamp_from_db(db):
    last_log = db.query(Logs).order_by(Logs.timestamp.desc()).first()
    return last_log.timestamp if last_log else None

def preprocess_log_entry(hit):
    source = hit['_source']
    try:
        return Logs(
            timestamp=datetime.strptime(source['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ"),
            log_type=source.get('fields', {}).get('log_type', 'unknown'),
            source_ip=source['source']['address'],
            host=source['host']['ip'][0],
            message=source['message'],
            event_data={
                "original": source['event']['original'],
                "os": source['host'].get('os', {}),
                "hostname": source['host'].get('hostname', '')
            },
            http_method=source.get('http', {}).get('request', {}).get('method', ''),
            http_status=source.get('http', {}).get('response', {}).get('status_code', ''),
            url=source.get('url', {}).get('original', ''),
            user_agent=source.get('user_agent', {}).get('original', ''),
            log_path=source.get('log', {}).get('file', {}).get('path', '')
        )
    except (KeyError, IndexError, ValueError) as e:
        logger.warning(f"Skipping log due to error: {e}")
        return None

def save_new_logs(log_hits, db, latest_timestamp):
    new_entries = []
    for hit in log_hits:
        log_entry = preprocess_log_entry(hit)
        if log_entry and (latest_timestamp is None or log_entry.timestamp > latest_timestamp):
            new_entries.append(log_entry)
    
    if new_entries:
        db.add_all(new_entries)
        db.commit()
        logger.info(f"Saved {len(new_entries)} new logs to database.")
    else:
        logger.info("No new logs to save.")

def scheduled_log_update():
    with SessionLocal() as db:
        latest_timestamp = get_latest_timestamp_from_db(db)
        log_hits = fetch_logs_from_elasticsearch()
        save_new_logs(log_hits, db, latest_timestamp)

# Start scheduler explicitly
scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_log_update, 'interval', minutes=5)
scheduler.start()
