import requests
from datetime import datetime
from database import SessionLocal
import json
from models.models import LogEntry, VerifiedIP
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor
import logging
import time

logger = logging.getLogger(__name__)

ES_ZEEK_URL = "http://localhost:9200/zeek-*/_search"
ES_SNORT_URL = "http://localhost:9200/snort-*/_search"
ES_SURICATA_URL = "http://localhost:9200/suricata-logs-*/_search"

# ADDED: New function with retry logic
def fetch_logs_with_retry(es_url, source_name, max_retries=3, backoff_factor=2):
    """Fetch logs with retry logic and exponential backoff"""
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    headers = {"Content-Type": "application/json"}
    
    for attempt in range(max_retries):
        try:
            # Add timeout to prevent hanging
            response = requests.get(es_url, json=query, headers=headers, timeout=10)
            response.raise_for_status()
            logs = response.json().get('hits', {}).get('hits', [])  
            return logs
        except requests.RequestException as e:
            wait_time = backoff_factor * (2 ** attempt)
            logger.warning(f"Attempt {attempt+1}/{max_retries} failed to fetch {source_name} logs: {e}. Retrying in {wait_time}s")
            
            if attempt < max_retries - 1:
                time.sleep(wait_time)
            else:
                logger.error(f"Failed to fetch {source_name} logs after {max_retries} attempts")
                return []

# MODIFIED: Updated to use the retry function
def fetch_logs_from_elasticsearch(es_url, source_name):
    return fetch_logs_with_retry(es_url, source_name)

# MODIFIED: Added error handling
def store_verified_logs(es_url, source_name):
    try:
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
                    logger.debug(f"IP '{ip}' is not verified. Log entry rejected.")  # Changed to debug level
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
    except Exception as e:
        logger.error(f"Error in store_verified_logs for {source_name}: {str(e)}")

# MODIFIED: Added timing and better error handling
def scheduled_log_update():
    """Process logs from all sources with better error handling"""
    start_time = datetime.utcnow()
    print(f"[{start_time}] Log Scheduler triggered.")
    
    try:
        store_verified_logs(ES_ZEEK_URL, "Zeek")
    except Exception as e:
        logger.error(f"Error processing Zeek logs: {str(e)}")
    
    try:
        store_verified_logs(ES_SNORT_URL, "Snort")
    except Exception as e:
        logger.error(f"Error processing Snort logs: {str(e)}")
    
    try:
        store_verified_logs(ES_SURICATA_URL, "Suricata")
    except Exception as e:
        logger.error(f"Error processing Suricata logs: {str(e)}")
    
    end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds()
    logger.info(f"Log update completed in {duration} seconds")

# ADDED: New function to create optimized scheduler
def create_optimized_scheduler():
    """Create and configure an APScheduler instance with optimized settings."""
    executors = {
        'default': ThreadPoolExecutor(20),
        'processpool': ProcessPoolExecutor(5)
    }
    
    job_defaults = {
        'coalesce': True,  # Combine missed executions
        'max_instances': 1,  # Keep at 1 to prevent overlapping jobs
        'misfire_grace_time': 30,  # Allow jobs to be run up to 30 seconds late
    }
    
    scheduler = BackgroundScheduler(
        executors=executors,
        job_defaults=job_defaults
    )
    
    return scheduler

# ADDED: Function to start the scheduler
def start_log_scheduler():
    """Start the scheduler for log processing."""
    scheduler = create_optimized_scheduler()
    if not scheduler.running:
        scheduler.add_job(
            scheduled_log_update,
            'interval', 
            seconds=15,  # Run every 15 seconds
            id='scheduled_log_update',
            replace_existing=True
        )
        scheduler.start()
        logger.info("Log scheduler started")
    else:
        logger.warning("Log scheduler is already running")
    return scheduler

if __name__ == "__main__":
    scheduled_log_update()
    print("Zeek, Snort, and Suricata logs fetched and saved to database.")