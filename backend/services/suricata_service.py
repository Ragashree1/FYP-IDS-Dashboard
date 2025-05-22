import requests
from datetime import datetime, timedelta
import json
import logging
from database import SessionLocal
from models.models import SuricataAlerts, VerifiedIP
from sqlalchemy import func, or_, and_

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_elasticsearch_alert_count():
    try:
        es_url = "http://54.91.203.196:9200/suricata-alerts-*,suricata-logs-*/_count"
        headers = {"Content-Type": "application/json"}
        
        # Check if Elasticsearch is reachable first
        try:
            health_check = requests.get("http://54.91.203.196:9200/_cluster/health", timeout=5)
            if health_check.status_code != 200:
                logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
                return 0
        except requests.exceptions.RequestException as e:
            logger.error(f"Cannot connect to Elasticsearch: {str(e)}")
            return 0
        
        response = requests.get(es_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch count: {response.status_code}")
            return 0
        
        result = response.json()
        count = result.get('count', 0)
        return count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count: {str(e)}")
        return 0

def get_elasticsearch_alert_count_by_signature():
    """Get alert counts grouped by signature"""
    try:
        es_url = "http://54.91.203.196:9200/suricata-alerts-*/_search"
        headers = {"Content-Type": "application/json"}
        
        query = {
            "size": 0,
            "aggs": {
                "signatures": {
                    "terms": {
                        "field": "alert.signature.keyword",
                        "size": 100
                    }
                }
            }
        }
        
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code}")
            return 0
        
        result = response.json()
        total_count = result.get('hits', {}).get('total', {}).get('value', 0)
        return total_count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count: {str(e)}")
        return 0

def get_database_alert_count(orgId: int):
    try:
        with SessionLocal() as db:
            count = db.query(func.count(SuricataAlerts.id)).filter(
                SuricataAlerts.organization_id == orgId,
                SuricataAlerts.alert_source == "suricata"
            ).scalar()
            return count
    except Exception as e:
        logger.error(f"Error getting database alert count: {str(e)}")
        return 0

def fetch_suricata_alerts(orgId: int):
    try:
        es_url = "http://54.91.203.196:9200/suricata-alerts-*,suricata-logs-*/_search"
        
        # First, check if Elasticsearch is reachable
        try:
            health_check = requests.get("http://54.91.203.196:9200/_cluster/health", timeout=5)
            if health_check.status_code != 200:
                logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
                return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Cannot connect to Elasticsearch: {str(e)}")
            return []
        
        query = {
            "size": 1000,
            "query": {
                "term": {
                    "event_type.keyword": "alert"
                }
            },
            "sort": [{"@timestamp": "desc"}]
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        return alerts
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to Elasticsearch: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_suricata_alerts: {str(e)}")
        return []

def fetch_suricata_alerts_by_ip(ip_address: str):
    try:
        es_url = "http://54.91.203.196:9200/suricata-alerts-*,suricata-logs-*/_search"
        
        # First, check if Elasticsearch is reachable
        try:
            health_check = requests.get("http://54.91.203.196:9200/_cluster/health", timeout=5)
            if health_check.status_code != 200:
                logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
                return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Cannot connect to Elasticsearch: {str(e)}")
            return []
        
        # Query for alerts that involve this IP address
        query = {
            "size": 1000,
            "query": {
                "bool": {
                    "must": [
                        {"term": {"event_type.keyword": "alert"}}
                    ],
                    "should": [
                        {"term": {"src_ip.keyword": ip_address}},
                        {"term": {"dest_ip.keyword": ip_address}}
                    ],
                    "minimum_should_match": 1
                }
            },
            "sort": [{"@timestamp": "desc"}]
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        return alerts
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to Elasticsearch: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_suricata_alerts_by_ip: {str(e)}")
        return []

def fetch_recent_alerts(limit=1000, minutes=5):
    """
    Fetch only the most recent alerts from Elasticsearch within the specified time window.
    
    Args:
        limit: Maximum number of alerts to fetch
        minutes: Only fetch alerts from the last X minutes
    """
    try:
        es_url = "http://54.91.203.196:9200/suricata-alerts-*/_search"
        headers = {"Content-Type": "application/json"}
        
        # Calculate timestamp for X minutes ago
        now = datetime.utcnow()
        time_ago = now - timedelta(minutes=minutes)
        time_ago_str = time_ago.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        
        # Query for recent alerts only
        query = {
            "size": limit,
            "query": {
                "bool": {
                    "must": [
                        {"term": {"event_type.keyword": "alert"}},
                        {"range": {"@timestamp": {"gte": time_ago_str}}}
                    ]
                }
            },
            "sort": [{"@timestamp": "desc"}]
        }
        
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        return alerts
    except Exception as e:
        logger.error(f"Error fetching recent alerts: {str(e)}")
        return []

def fetch_new_alerts(orgId: int, start_time=None):
    """Fetch only new alerts since the given timestamp"""
    try:
        es_url = "http://54.91.203.196:9200/suricata-alerts-*/_search"
        
        # Build a query that gets alerts after the start_time
        query = {
            "size": 1000,
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "event_type.keyword": "alert"
                            }
                        }
                    ]
                }
            },
            "sort": [{"@timestamp": "desc"}]
        }
        
        # Add time filter if provided
        if start_time:
            query["query"]["bool"]["must"].append({
                "range": {
                    "@timestamp": {
                        "gt": start_time
                    }
                }
            })
        
        headers = {"Content-Type": "application/json"}
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        return alerts
    except Exception as e:
        logger.error(f"Error fetching new alerts: {str(e)}")
        return []

def verify_logs(logs: list, orgId: int):
    verified_logs = []
    
    # Get verified IPs from database
    with SessionLocal() as db:
        verified_ips = set(ip[0] for ip in db.query(VerifiedIP.ip)
            .filter(VerifiedIP.organization_id == orgId, VerifiedIP.is_verified == True).all())
    
    if not verified_ips:
        logger.error(f"No verified IPs found for organization {orgId}. Skipping verification.")
        return []
    
    for hit in logs:
        source = hit.get("_source", {})
        
        # Get source IP
        src_ip = source.get("src_ip", "")
        if isinstance(src_ip, list) and len(src_ip) > 0:
            src_ip = src_ip[0]
            
        # Get destination IP
        dest_ip = source.get("dest_ip", "")
        if isinstance(dest_ip, list) and len(dest_ip) > 0:
            dest_ip = dest_ip[0]
        
        if not src_ip and not dest_ip:
            continue
        
        # Check if EITHER the source IP OR destination IP is in the verified IPs set
        if src_ip in verified_ips or dest_ip in verified_ips:
            verified_logs.append(hit)

    return verified_logs

def get_existing_alert_ids(db, orgId: int):
    try:
        results = db.query(
            SuricataAlerts.signature_id,
            SuricataAlerts.src_ip,
            SuricataAlerts.dest_ip,
            SuricataAlerts.timestamp
        ).filter(
            SuricataAlerts.organization_id == orgId,
            SuricataAlerts.alert_source == "suricata"
        ).all()
        return {(str(r.signature_id), r.src_ip, r.dest_ip, r.timestamp) for r in results}
    except Exception as e:
        logger.error(f"Error getting existing alert IDs: {str(e)}")
        return set()

def save_suricata_alerts(alerts, orgId: int):
    try:
        with SessionLocal() as db:
            existing_alerts = get_existing_alert_ids(db, orgId)
            
            saved_count = 0
            duplicate_count = 0
            error_count = 0

            for alert in alerts:
                try:
                    source = alert.get("_source", {})
                    
                    # Extract alert fields from the correct locations based on your Elasticsearch data
                    alert_data = source.get("alert", {})
                    
                    # Get signature_id from alert.signature_id
                    signature_id = str(alert_data.get("signature_id", 0))
                    
                    # Get message from alert.signature
                    message = alert_data.get("signature", "")
                    
                    # Get classification from alert.category
                    classification = alert_data.get("category", "")
                    
                    # Get priority from alert.severity
                    priority = alert_data.get("severity", 3)
                    
                    # Get action from alert.action
                    action = alert_data.get("action", "")
                    
                    # Get protocol
                    protocol = source.get("proto", "")
                    
                    # Get timestamp
                    timestamp = source.get("timestamp", "") or source.get("@timestamp", datetime.now().isoformat())
                    
                    # Get flow information
                    flow = source.get("flow", {})
                    
                    # Get source IP and port
                    src_ip = source.get("src_ip", "")
                    if isinstance(src_ip, list) and len(src_ip) > 0:
                        src_ip = src_ip[0]
                        
                    src_port = source.get("src_port", 0)
                    if isinstance(src_port, list) and len(src_port) > 0:
                        src_port = src_port[0]
                    
                    # Get destination IP and port
                    dest_ip = source.get("dest_ip", "")
                    if isinstance(dest_ip, list) and len(dest_ip) > 0:
                        dest_ip = dest_ip[0]
                        
                    dest_port = source.get("dest_port", 0)
                    if isinstance(dest_port, list) and len(dest_port) > 0:
                        dest_port = dest_port[0]
                    
                    # Get direction
                    direction = source.get("direction", "->")
                    
                    # Get host
                    host_data = source.get("host", {})
                    host = host_data.get("name", "") if isinstance(host_data, dict) else ""
                    
                    # Create a unique key for deduplication
                    alert_key = (signature_id, src_ip, dest_ip, timestamp)
                    if alert_key in existing_alerts:
                        duplicate_count += 1
                        continue
                    
                    existing_alerts.add(alert_key)

                    # Create the database object with all fields properly mapped
                    db_alert = SuricataAlerts(
                        timestamp=timestamp,
                        priority=priority,
                        protocol=protocol,
                        raw=json.dumps(source),  # Store the full raw alert
                        length=flow.get("bytes_toserver", 0) + flow.get("bytes_toclient", 0),
                        direction=direction,
                        src_ip=src_ip,
                        src_port=src_port,
                        dest_ip=dest_ip,
                        dest_port=dest_port,
                        signature_id=signature_id,
                        action=action,
                        message=message,
                        classification=classification,
                        host=host,
                        alert_source="suricata",
                        organization_id=orgId
                    )
                    db.add(db_alert)
                    saved_count += 1
                except Exception as e:
                    logger.error(f"Error processing alert: {str(e)}")
                    error_count += 1

            db.commit()
    except Exception as e:
        logger.error(f"Error saving Suricata alerts to database: {str(e)}")

def update_and_fetch_suricata_alerts(orgId: int):
    try:
        # Validate organization ID
        if not orgId or orgId <= 0:
            logger.error(f"Invalid organization ID: {orgId}")
            return []

        # Get verified IPs from database
        with SessionLocal() as db:
            verified_ips = db.query(VerifiedIP.ip).filter_by(
                organization_id=orgId, 
                is_verified=True
            ).all()
            
            if not verified_ips:
                logger.warning(f"No verified IPs found for organization {orgId}.")
                return []
                
            # Create a set of verified IPs for faster lookups
            verified_set = {ip[0] for ip in verified_ips}
        
        # Import recent alerts (last 5 minutes)
        force_import_alerts(orgId, limit=1000, minutes=5)
        
        # Now retrieve all alerts for this organization from the database
        with SessionLocal() as db:
            # Only return alerts that match verified IPs
            org_alerts = db.query(SuricataAlerts).filter(
                SuricataAlerts.organization_id == orgId,
                SuricataAlerts.alert_source == "suricata",
                or_(SuricataAlerts.src_ip.in_(verified_set), SuricataAlerts.dest_ip.in_(verified_set))
            ).all()
            
            return org_alerts
    except Exception as e:
        logger.error(f"Error in update_and_fetch_suricata_alerts: {str(e)}")
        return []

def force_import_alerts(orgId: int, limit: int = 1000, minutes: int = 5):
    """
    Force import alerts from Elasticsearch to the database.
    
    Args:
        orgId: The organization ID to associate with the alerts
        limit: Maximum number of alerts to import
        minutes: Only import alerts from the last X minutes
    """
    try:
        # Get verified IPs from database
        with SessionLocal() as db:
            verified_ips = db.query(VerifiedIP.ip).filter_by(
                organization_id=orgId, 
                is_verified=True
            ).all()
            
            if not verified_ips:
                logger.warning(f"No verified IPs found for organization {orgId}.")
                return False
                
            # Create a set of verified IPs for faster lookups
            verified_set = {ip[0] for ip in verified_ips}
        
        # Fetch recent alerts (from the last X minutes)
        alerts = fetch_recent_alerts(limit=limit, minutes=minutes)
        
        if not alerts:
            return False
        
        # Filter alerts by verified IPs
        filtered_alerts = []
        for alert in alerts:
            source = alert.get("_source", {})
            
            src_ip = source.get("src_ip", "")
            if isinstance(src_ip, list) and len(src_ip) > 0:
                src_ip = src_ip[0]
                
            dest_ip = source.get("dest_ip", "")
            if isinstance(dest_ip, list) and len(dest_ip) > 0:
                dest_ip = dest_ip[0]
            
            if src_ip in verified_set or dest_ip in verified_set:
                filtered_alerts.append(alert)
        
        alerts = filtered_alerts
        
        # Check for duplicates in the database
        if alerts:
            with SessionLocal() as db:
                # Extract signature IDs, source IPs, destination IPs, and timestamps from the alerts
                alert_keys = []
                for alert in alerts:
                    source = alert.get("_source", {})
                    alert_data = source.get("alert", {})
                    signature_id = str(alert_data.get("signature_id", 0))
                    
                    src_ip = source.get("src_ip", "")
                    if isinstance(src_ip, list) and len(src_ip) > 0:
                        src_ip = src_ip[0]
                        
                    dest_ip = source.get("dest_ip", "")
                    if isinstance(dest_ip, list) and len(dest_ip) > 0:
                        dest_ip = dest_ip[0]
                        
                    timestamp = source.get("timestamp", "") or source.get("@timestamp", "")
                    
                    alert_keys.append((signature_id, src_ip, dest_ip, timestamp))
                
                # Query for existing alerts with the same signature_id, src_ip, dest_ip, and timestamp
                if alert_keys:
                    # Use batching to avoid too large queries
                    batch_size = 100
                    all_existing_alerts = set()
                    
                    for i in range(0, len(alert_keys), batch_size):
                        batch = alert_keys[i:i+batch_size]
                        
                        existing_alerts_query = db.query(SuricataAlerts).filter(
                            or_(*[
                                and_(
                                    SuricataAlerts.signature_id == key[0],
                                    SuricataAlerts.src_ip == key[1],
                                    SuricataAlerts.dest_ip == key[2],
                                    SuricataAlerts.timestamp == key[3]
                                ) for key in batch
                            ])
                        ).all()
                        
                        for alert in existing_alerts_query:
                            all_existing_alerts.add((
                                alert.signature_id,
                                alert.src_ip,
                                alert.dest_ip,
                                alert.timestamp
                            ))
                
                # Filter out alerts that already exist in ANY organization
                filtered_alerts = []
                for alert in alerts:
                    source = alert.get("_source", {})
                    alert_data = source.get("alert", {})
                    signature_id = str(alert_data.get("signature_id", 0))
                    
                    src_ip = source.get("src_ip", "")
                    if isinstance(src_ip, list) and len(src_ip) > 0:
                        src_ip = src_ip[0]
                        
                    dest_ip = source.get("dest_ip", "")
                    if isinstance(dest_ip, list) and len(dest_ip) > 0:
                        dest_ip = dest_ip[0]
                        
                    timestamp = source.get("timestamp", "") or source.get("@timestamp", "")
                    
                    if (signature_id, src_ip, dest_ip, timestamp) not in all_existing_alerts:
                        filtered_alerts.append(alert)
                
                alerts = filtered_alerts
        
        if alerts:
            # Use batch processing for saving alerts
            batch_size = 100
            
            for i in range(0, len(alerts), batch_size):
                batch = alerts[i:i+batch_size]
                save_suricata_alerts(batch, orgId)
            
            return True
        else:
            return False
            
    except Exception as e:
        logger.error(f"Error importing alerts: {str(e)}")
        return False

def import_suricata_alerts_for_all_orgs(limit: int = 1000, minutes: int = 5):
    """
    Fetch recent Suricata alerts from Elasticsearch and assign them to organizations
    based on the verified IPs table. No orgId is passed; the mapping is done automatically.
    """
    try:
        # Step 1: Build a mapping of verified IP -> organization_id
        with SessionLocal() as db:
            verified_ip_org_map = dict(
                db.query(VerifiedIP.ip, VerifiedIP.organization_id)
                .filter(VerifiedIP.is_verified == True, VerifiedIP.organization_id != None)
                .all()
            )
            if not verified_ip_org_map:
                logger.warning("No verified IPs found in any organization.")
                return False

        # Step 2: Fetch recent alerts from Elasticsearch
        alerts = fetch_recent_alerts(limit=limit, minutes=minutes)
        if not alerts:
            logger.info("No recent alerts fetched from Elasticsearch.")
            return False

        # Step 3: For each alert, check if src_ip or dest_ip is in verified_ip_org_map
        org_alerts_map = {}  # org_id -> list of alerts
        for alert in alerts:
            source = alert.get("_source", {})
            src_ip = source.get("src_ip", "")
            if isinstance(src_ip, list) and len(src_ip) > 0:
                src_ip = src_ip[0]
            dest_ip = source.get("dest_ip", "")
            if isinstance(dest_ip, list) and len(dest_ip) > 0:
                dest_ip = dest_ip[0]

            org_ids = set()
            if src_ip in verified_ip_org_map:
                org_ids.add(verified_ip_org_map[src_ip])
            if dest_ip in verified_ip_org_map:
                org_ids.add(verified_ip_org_map[dest_ip])

            for org_id in org_ids:
                if org_id is not None:
                    org_alerts_map.setdefault(org_id, []).append(alert)

        # Step 4: Save alerts for each organization
        for org_id, org_alerts in org_alerts_map.items():
            save_suricata_alerts(org_alerts, org_id)

        logger.info(f"Imported alerts for {len(org_alerts_map)} organizations.")
        return True
    except Exception as e:
        logger.error(f"Error in import_alerts_for_all_orgs: {str(e)}")
        return False
