import requests
from datetime import datetime
from database import SessionLocal
import json
from models.models import LogEntry, VerifiedIP
from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger(__name__)

ES_ZEEK_URL = "http://localhost:9200/zeek-*/_search"
ES_SNORT_URL = "http://localhost:9200/snort-*/_search"
ES_SURICATA_URL = "http://localhost:9200/suricata-logs-*/_search"


def fetch_logs_from_elasticsearch(es_url, source_name):
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.get(es_url, json=query, headers=headers)
        response.raise_for_status()
        logs = response.json().get('hits', {}).get('hits', [])  
        return logs
    except requests.RequestException as e:
        logger.error(f"Error fetching {source_name} logs from Elasticsearch: {e}")
        return []

def store_verified_logs(es_url, source_name): 
    log_hits = fetch_logs_from_elasticsearch(es_url, source_name)
    stored_logs = 0

    with SessionLocal() as db:
        for hit in log_hits:
            source = hit.get("_source", {})

            ip_list = source.get("host", {}).get("ip", [])
            ip = next((addr for addr in ip_list if ":" not in addr), None)
            if not ip:
                continue

            log_data = json.dumps(source)

            timestamp_str = source.get("@timestamp")

            try:
                timestamp = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S.%fZ")
            except Exception:
                timestamp = datetime.utcnow()

            verified = db.query(VerifiedIP).filter_by(ip=ip, is_verified=True).first()
            if not verified:
                logger.warning(f"IP '{ip}' is not verified. Log entry rejected.")
                continue

            entry = LogEntry(
                organization_id=verified.organization_id,
                ip=ip,
                log_data=log_data,
                timestamp=timestamp
            )
            db.add(entry)
            print(f"[{source_name}] Stored log entry for IP: {ip}")
            stored_logs += 1

        db.commit()
        logger.info(f"Stored {stored_logs} verified {source_name} logs from Elasticsearch.")


def scheduled_log_update():
    print(f"[{datetime.utcnow()}] Log Scheduler triggered.")
    store_verified_logs(ES_ZEEK_URL, "Zeek")
    store_verified_logs(ES_SNORT_URL, "Snort")
    store_verified_logs(ES_SURICATA_URL, "Suricata")


if __name__ == "__main__":
    scheduled_log_update()
    print("Zeek, Snort, and Suricata logs fetched and saved to database.")

