import requests
from datetime import datetime, timedelta
import json
import logging
from database import SessionLocal
from models.models import ZeekAlerts, VerifiedIP
from sqlalchemy import func, or_, and_

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

LOW_VALUE_ALERTS = [
    "Conn::Content_Gap",
    "Weird::Activity"
]


def get_elasticsearch_alert_count():
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_count"
        headers = {"Content-Type": "application/json"}

        health_check = requests.get("http://localhost:9200/_cluster/health", timeout=5)
        if health_check.status_code != 200:
            logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
            return 0

        response = requests.get(es_url, headers=headers, timeout=10)
        result = response.json()
        count = result.get('count', 0)
        logger.info(f"Total Zeek alerts in Elasticsearch: {count}")
        return count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count: {str(e)}")
        return 0


def get_elasticsearch_alert_count_by_note():
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_search"
        headers = {"Content-Type": "application/json"}
        query = {
            "size": 0,
            "aggs": {
                "attack_types": {
                    "terms": {
                        "field": "note.keyword",
                        "size": 100
                    }
                }
            }
        }

        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        result = response.json()
        total_count = result.get('hits', {}).get('total', {}).get('value', 0)

        buckets = result.get('aggregations', {}).get('attack_types', {}).get('buckets', [])
        if buckets:
            logger.info("Attack types distribution:")
            for bucket in buckets:
                logger.info(f"  - {bucket.get('key')}: {bucket.get('doc_count')}")

        return total_count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count by note: {str(e)}")
        return 0


def get_database_alert_count(orgId: int):
    try:
        with SessionLocal() as db:
            count = db.query(func.count(ZeekAlerts.id)).filter(
                ZeekAlerts.organization_id == orgId,
                ZeekAlerts.alert_source == "zeek"
            ).scalar()
            logger.info(f"Total Zeek alerts in database for org {orgId}: {count}")
            return count
    except Exception as e:
        logger.error(f"Error getting database alert count: {str(e)}")
        return 0


def fetch_recent_alerts(limit=1000, minutes=5):
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_search"
        headers = {"Content-Type": "application/json"}
        time_ago = datetime.utcnow() - timedelta(minutes=minutes)
        time_ago_str = time_ago.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        query = {
            "size": limit,
            "query": {"range": {"@timestamp": {"gte": time_ago_str}}},
            "sort": [{"@timestamp": "desc"}]
        }

        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        return response.json().get('hits', {}).get('hits', [])
    except Exception as e:
        logger.error(f"Error fetching recent alerts: {str(e)}")
        return []


def verify_logs(logs: list, orgId: int):
    verified_logs = []
    with SessionLocal() as db:
        verified_ips = db.query(VerifiedIP.ip).filter_by(
            organization_id=orgId,
            is_verified=True
        ).all()
        verified_set = {ip for (ip,) in verified_ips}

    for hit in logs:
        source = hit.get("_source", {})
        src_ip = source.get("src_ip", "")
        dest_ip = source.get("dest_ip", "")

        if isinstance(src_ip, list):
            src_ip = src_ip[0] if src_ip else ""
        if isinstance(dest_ip, list):
            dest_ip = dest_ip[0] if dest_ip else ""

        if src_ip in verified_set or dest_ip in verified_set:
            verified_logs.append(hit)

    logger.info(f"Verified {len(verified_logs)} logs out of {len(logs)} total.")
    return verified_logs


def is_low_value_alert(note, protocol):
    return note in LOW_VALUE_ALERTS or (not note or note.strip() == "N/A") and protocol == "tcp"



def get_existing_alert_ids(db, orgId: int):
    try:
        records = db.query(ZeekAlerts.uid, ZeekAlerts.src_ip, ZeekAlerts.dest_ip, ZeekAlerts.timestamp).filter(
            ZeekAlerts.organization_id == orgId,
            ZeekAlerts.alert_source == "zeek"
        ).all()
        return {(r.uid, r.src_ip, r.dest_ip, r.timestamp) for r in records}
    except Exception as e:
        logger.error(f"Error getting existing alert IDs: {str(e)}")
        return set()


def save_zeek_alerts(alerts, orgId: int):
    with SessionLocal() as db:
        existing_alerts = get_existing_alert_ids(db, orgId)
        to_add = []

        for alert in alerts:
            try:
                source = alert.get("_source", {})
                note = source.get("note", "")
                protocol = source.get("proto", "").lower()

                if not note or note == "N/A" or is_low_value_alert(note, protocol):
                    continue

                src_ip = source.get("src_ip", "")
                if isinstance(src_ip, list) and src_ip:
                    src_ip = src_ip[0]

                dest_ip = source.get("dest_ip", "")
                if isinstance(dest_ip, list) and dest_ip:
                    dest_ip = dest_ip[0]

                src_port = source.get("src_port", 0)
                dest_port = source.get("dest_port", 0)
                if isinstance(src_port, list): src_port = src_port[0]
                if isinstance(dest_port, list): dest_port = dest_port[0]

                timestamp = source.get("@timestamp", datetime.utcnow().isoformat())
                uid = source.get("uid", "")

                if (uid, src_ip, dest_ip, timestamp) in existing_alerts:
                    continue

                existing_alerts.add((uid, src_ip, dest_ip, timestamp))

                db_alert = ZeekAlerts(
                    timestamp=timestamp,
                    priority = source.get("priority", 4),
                    protocol=protocol,
                    raw=json.dumps(source),
                    length=source.get("p"),
                    direction=source.get("direction"),
                    src_ip=src_ip,
                    src_port=src_port,
                    dest_ip=dest_ip,
                    dest_port=dest_port,
                    signature_id=note,
                    action=source.get("actions")[0] if source.get("actions") else None,
                    message=source.get("msg", ""),
                    classification=note,
                    host=source.get("host", {}).get("name", ""),
                    alert_source="zeek",
                    conn_id=f"{src_ip}:{src_port}-{dest_ip}:{dest_port}",
                    event_type=source.get("_path", ""),
                    uid=uid,
                    service=source.get("service", ""),
                    organization_id=orgId
                )
                to_add.append(db_alert)
            except Exception as e:
                logger.error(f"Error processing alert: {str(e)}")

        if to_add:
            db.add_all(to_add)
            db.commit()
            logger.info(f"Saved {len(to_add)} new Zeek alerts.")


def force_import_alerts(orgId: int, limit=1000, minutes=5):
    alerts = fetch_recent_alerts(limit=limit, minutes=minutes)
    if not alerts:
        logger.info("No recent alerts found.")
        return False

    filtered = verify_logs(alerts, orgId)
    if not filtered:
        logger.info("No verified logs to import.")
        return False

    save_zeek_alerts(filtered, orgId)
    return True


def update_and_fetch_zeek_alerts(orgId: int):
    logger.info(f"Updating and fetching Zeek alerts for org {orgId}")

    with SessionLocal() as db:
        verified = db.query(VerifiedIP.ip).filter_by(organization_id=orgId, is_verified=True).all()
        if not verified:
            logger.warning(f"No verified IPs for org {orgId}. Aborting.")
            return []

        verified_set = {ip for (ip,) in verified}

    force_import_alerts(orgId, limit=1000, minutes=5)

    with SessionLocal() as db:
        alerts = db.query(ZeekAlerts).filter(
            ZeekAlerts.organization_id == orgId,
            ZeekAlerts.alert_source == "zeek",
            or_(ZeekAlerts.src_ip.in_(verified_set), ZeekAlerts.dest_ip.in_(verified_set)),
            ~ZeekAlerts.signature_id.in_(LOW_VALUE_ALERTS),
            ~((ZeekAlerts.signature_id == "") |
              (ZeekAlerts.signature_id == "N/A") |
              (ZeekAlerts.signature_id == None))
        ).all()
        logger.info(f"Returning {len(alerts)} filtered Zeek alerts.")
        return alerts