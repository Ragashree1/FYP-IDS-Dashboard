import requests
import subprocess
import socket
from datetime import datetime, timezone, timedelta
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

# Set to False to bypass IP verification if needed
ENABLE_IP_VERIFICATION = True

def get_vm_ip():
    """Get the IP address of the current VM"""
    try:
        # This gets the primary IP address of the machine
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Connect to Google's DNS
        ip = s.getsockname()[0]
        s.close()
        logger.info(f"VM IP address: {ip}")
        return ip
    except Exception as e:
        logger.error(f"Error getting VM IP: {str(e)}")
        return None

def is_service_running(service_name):
    try:
        if service_name == 'suricata':
            result = subprocess.run(["systemctl", "status", "suricata"],
                                    capture_output=True, text=True)
            return "active (running)" in result.stdout
        else:
            return False
    except Exception as e:
        logger.error(f"Error checking {service_name} status: {str(e)}")
        return False

def get_elasticsearch_alert_count():
    try:
        es_url = "http://localhost:9200/suricata-alerts-*,suricata-logs-*/_count"
        headers = {"Content-Type": "application/json"}
        
        # Check if Elasticsearch is reachable first
        try:
            health_check = requests.get("http://localhost:9200/_cluster/health", timeout=5)
            if health_check.status_code != 200:
                logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
                return 0
            logger.info("Elasticsearch health check passed")
        except requests.exceptions.RequestException as e:
            logger.error(f"Cannot connect to Elasticsearch: {str(e)}")
            return 0
        
        response = requests.get(es_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch count: {response.status_code} - {response.text}")
            return 0
        
        result = response.json()
        count = result.get('count', 0)
        logger.info(f"Total alerts in Elasticsearch: {count}")
        return count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count: {str(e)}")
        return 0

def get_elasticsearch_alert_count_by_signature():
    """Get alert counts grouped by signature"""
    try:
        es_url = "http://localhost:9200/suricata-alerts-*/_search"
        headers = {"Content-Type": "application/json"}
        
        # Use the aggregation query you provided
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
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return 0
        
        result = response.json()
        total_count = result.get('hits', {}).get('total', {}).get('value', 0)
        logger.info(f"Total alerts in Elasticsearch: {total_count}")
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
            logger.info(f"Total alerts in database for org {orgId}: {count}")
            return count
    except Exception as e:
        logger.error(f"Error getting database alert count: {str(e)}")
        return 0

def fetch_suricata_alerts(orgId: int):
    try:
        es_url = "http://localhost:9200/suricata-alerts-*,suricata-logs-*/_search"
        
        # First, check if Elasticsearch is reachable
        try:
            health_check = requests.get("http://localhost:9200/_cluster/health", timeout=5)
            if health_check.status_code != 200:
                logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
                return []
            logger.info("Elasticsearch health check passed")
        except requests.exceptions.RequestException as e:
            logger.error(f"Cannot connect to Elasticsearch: {str(e)}")
            return []
        
        # CRITICAL FIX: Use the exact same query that worked in the curl command
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
        logger.info(f"Fetching Suricata alerts from {es_url} with event_type: alert")
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} Suricata alerts from Elasticsearch")

        if len(alerts) > 0:
            logger.info(f"Sample alert: {json.dumps(alerts[0].get('_source', {}), indent=2)}")
        else:
            logger.warning("No alerts found in Elasticsearch with event_type: alert")
            
        logger.info(f"Returning {len(alerts)} alerts for processing")
        return alerts
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to Elasticsearch: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_suricata_alerts: {str(e)}")
        return []

def fetch_suricata_alerts_by_ip(ip_address: str):
    try:
        es_url = "http://localhost:9200/suricata-alerts-*,suricata-logs-*/_search"
        
        # First, check if Elasticsearch is reachable
        try:
            health_check = requests.get("http://localhost:9200/_cluster/health", timeout=5)
            if health_check.status_code != 200:
                logger.error(f"Elasticsearch health check failed: {health_check.status_code}")
                return []
            logger.info("Elasticsearch health check passed")
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
        logger.info(f"Fetching Suricata alerts from {es_url} for IP: {ip_address}")
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} Suricata alerts from Elasticsearch for IP: {ip_address}")

        if len(alerts) > 0:
            logger.info(f"Sample alert: {json.dumps(alerts[0].get('_source', {}), indent=2)}")
        else:
            logger.warning(f"No alerts found in Elasticsearch for IP: {ip_address}")
            
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
        es_url = "http://localhost:9200/suricata-alerts-*/_search"
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
        
        logger.info(f"Fetching alerts from the last {minutes} minutes")
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} recent alerts from Elasticsearch")
        
        return alerts
    except Exception as e:
        logger.error(f"Error fetching recent alerts: {str(e)}")
        return []

def fetch_new_alerts(orgId: int, start_time=None):
    """Fetch only new alerts since the given timestamp"""
    try:
        es_url = "http://localhost:9200/suricata-alerts-*/_search"
        
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
        logger.info(f"Fetching new Suricata alerts from {es_url}")
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} new Suricata alerts from Elasticsearch")
        
        return alerts
    except Exception as e:
        logger.error(f"Error fetching new alerts: {str(e)}")
        return []

def verify_logs(logs: list, orgId: int):
    verified_logs = []
    verified_logs_count = 0
    skipped_logs_count = 0
    
    # Get the VM's actual IP address
    vm_ip = get_vm_ip()
    if not vm_ip:
        logger.error("Could not determine VM IP address. Skipping verification.")
        return []  # Return empty list if we can't determine VM IP
    
    logger.info(f"Verifying logs against VM IP: {vm_ip}")
    
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
            skipped_logs_count += 1
            continue
        
        # Check if EITHER the source IP OR destination IP matches the VM's IP
        if src_ip == vm_ip or dest_ip == vm_ip:
            verified_logs.append(hit)
            verified_logs_count += 1
            logger.info(f"VERIFIED: Alert with src_ip={src_ip}, dest_ip={dest_ip} matches VM IP {vm_ip}")
        else:
            skipped_logs_count += 1
            logger.info(f"SKIPPED: Alert with src_ip={src_ip}, dest_ip={dest_ip} does not match VM IP {vm_ip}")

    logger.info(f"Verification results: {verified_logs_count} verified, {skipped_logs_count} skipped")
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
            logger.info(f"Processed {len(alerts)} alerts: {saved_count} saved, {duplicate_count} duplicates, {error_count} errors")
    except Exception as e:
        logger.error(f"Error saving Suricata alerts to database: {str(e)}")

def update_and_fetch_suricata_alerts(orgId: int):
    try:
        # CRITICAL FIX: Validate organization ID
        if not orgId or orgId <= 0:
            logger.error(f"Invalid organization ID: {orgId}")
            return []
            
        logger.info(f"Processing alerts for organization ID: {orgId}")
        
        is_running = is_service_running('suricata')
        logger.info(f"Suricata running status: {is_running}")

        # Get the VM's IP for filtering
        vm_ip = get_vm_ip()
        if not vm_ip:
            logger.error("Could not determine VM IP address. Skipping alert processing.")
            return []
            
        logger.info(f"Current VM IP: {vm_ip}")
        
        # Check if the VM's IP is in the VerifiedIP table for this organization
        with SessionLocal() as db:
            verified_ip = db.query(VerifiedIP).filter_by(
                organization_id=orgId, 
                ip=vm_ip, 
                is_verified=True
            ).first()
            
            if ENABLE_IP_VERIFICATION and not verified_ip:
                logger.warning(f"VM IP {vm_ip} is not in the verified IP list for organization {orgId}. Skipping alert processing.")
                return []
                
        logger.info(f"VM IP {vm_ip} is verified for organization {orgId}. Proceeding with alert processing.")
        
        # PERFORMANCE IMPROVEMENT: Only fetch recent alerts (last 5 minutes)
        # This makes the function much faster and more responsive to new attacks
        logger.info(f"Fetching recent alerts for organization {orgId}")
        
        # Import recent alerts (last 5 minutes)
        force_import_alerts(orgId, limit=1000, minutes=5)
        
        # Now retrieve all alerts for this organization from the database
        with SessionLocal() as db:
            # CRITICAL FIX: Only return alerts that match the VM's IP
            if ENABLE_IP_VERIFICATION:
                logger.info(f"Filtering database alerts by VM IP: {vm_ip}")
                org_alerts = db.query(SuricataAlerts).filter(
                    SuricataAlerts.organization_id == orgId,
                    SuricataAlerts.alert_source == "suricata",
                    or_(SuricataAlerts.src_ip == vm_ip, SuricataAlerts.dest_ip == vm_ip)
                ).all()
            else:
                org_alerts = db.query(SuricataAlerts).filter(
                    SuricataAlerts.organization_id == orgId,
                    SuricataAlerts.alert_source == "suricata"
                ).all()
            
            logger.info(f"Returning {len(org_alerts)} Suricata alerts from DB for org {orgId}")
            
            # Add this to debug empty results
            if not org_alerts:
                logger.warning(f"No alerts found in database for organization {orgId}")
            
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
        # Get the VM's IP for filtering
        vm_ip = get_vm_ip()
        if not vm_ip and ENABLE_IP_VERIFICATION:
            logger.error("Could not determine VM IP address. Skipping alert processing.")
            return False
            
        logger.info(f"Current VM IP: {vm_ip}")
        
        # Check if the VM's IP is in the VerifiedIP table for this organization
        if ENABLE_IP_VERIFICATION:
            with SessionLocal() as db:
                verified_ip = db.query(VerifiedIP).filter_by(
                    organization_id=orgId, 
                    ip=vm_ip, 
                    is_verified=True
                ).first()
                
                if not verified_ip:
                    logger.warning(f"VM IP {vm_ip} is not in the verified IP list for organization {orgId}. Skipping alert processing.")
                    return False
                    
            logger.info(f"VM IP {vm_ip} is verified for organization {orgId}. Proceeding with alert processing.")
        
        # Fetch recent alerts (from the last X minutes)
        alerts = fetch_recent_alerts(limit=limit, minutes=minutes)
        
        if not alerts:
            logger.warning("No recent alerts found in Elasticsearch")
            return False
            
        logger.info(f"Processing {len(alerts)} recent alerts")
        
        # If IP verification is enabled, filter alerts by VM IP
        if ENABLE_IP_VERIFICATION:
            filtered_alerts = []
            for alert in alerts:
                source = alert.get("_source", {})
                
                src_ip = source.get("src_ip", "")
                if isinstance(src_ip, list) and len(src_ip) > 0:
                    src_ip = src_ip[0]
                    
                dest_ip = source.get("dest_ip", "")
                if isinstance(dest_ip, list) and len(dest_ip) > 0:
                    dest_ip = dest_ip[0]
                
                if src_ip == vm_ip or dest_ip == vm_ip:
                    filtered_alerts.append(alert)
            
            logger.info(f"After IP filtering: {len(filtered_alerts)} of {len(alerts)} alerts match VM IP {vm_ip}")
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
                
                logger.info(f"After filtering out existing alerts: {len(filtered_alerts)} of {len(alerts)} alerts remaining")
                alerts = filtered_alerts
        
        if alerts:
            # Use batch processing for saving alerts
            batch_size = 100
            total_saved = 0
            
            for i in range(0, len(alerts), batch_size):
                batch = alerts[i:i+batch_size]
                save_suricata_alerts(batch, orgId)
                total_saved += len(batch)
                logger.info(f"Saved batch {i//batch_size + 1}: {len(batch)} alerts")
            
            logger.info(f"Total imported: {total_saved} alerts to database for organization {orgId}")
            
            # Verify alerts were saved
            with SessionLocal() as db:
                count = db.query(func.count(SuricataAlerts.id)).filter(
                    SuricataAlerts.organization_id == orgId,
                    SuricataAlerts.alert_source == "suricata"
                ).scalar()
                
            logger.info(f"After import: {count} alerts in database for org {orgId}")
            return True
        else:
            logger.warning("No new alerts found to import")
            return False
            
    except Exception as e:
        logger.error(f"Error importing alerts: {str(e)}")
        return False

# Add this function to help with debugging
def check_database_alerts(orgId: int):
    """
    Utility function to check alerts in the database for a specific organization.
    """
    try:
        with SessionLocal() as db:
            alerts = db.query(SuricataAlerts).filter(
                SuricataAlerts.organization_id == orgId,
                SuricataAlerts.alert_source == "suricata"
            ).all()
            
            logger.info(f"Found {len(alerts)} Suricata alerts in database for org {orgId}")
            
            if alerts:
                logger.info("Sample alert from database:")
                sample = alerts[0]
                logger.info(f"ID: {sample.id}")
                logger.info(f"Timestamp: {sample.timestamp}")
                logger.info(f"Message: {sample.message}")
                logger.info(f"Source IP: {sample.src_ip}")
                logger.info(f"Destination IP: {sample.dest_ip}")
            else:
                logger.info("No alerts found in database")
                
            return alerts
    except Exception as e:
        logger.error(f"Error checking database: {e}")
        return []