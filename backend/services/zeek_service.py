import requests
import subprocess
import socket
from datetime import datetime, timedelta
import json
import logging
from database import SessionLocal
from models.models import ZeekAlerts, VerifiedIP
from sqlalchemy import func, or_, and_, not_

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Set to False to bypass IP verification if needed
ENABLE_IP_VERIFICATION = True

# Define a list of low-value alert types to filter out
# Removed CaptureLoss::Too_Much_Loss from this list
LOW_VALUE_ALERTS = [
    "Conn::Content_Gap",
    "Weird::Activity"
]

# Define alert priorities by type
ALERT_PRIORITIES = {
    # High priority alerts (1)
    "SQL_Injection": 1,
    "XSS_Attack": 1,
    "Command_Injection": 1,
    "Path_Traversal": 1,
    "Brute_Force_Attempt": 1,
    "HTTP_Header_Attack": 1,
    "File_Upload_Attempt": 1,
    "sniffpass::http_post_password_seen": 1,
    
    # Medium priority alerts (2)
    "Scan::Port_Scan": 2,
    "Scan::Address_Scan": 2,
    "CaptureLoss::Too_Much_Loss": 2,  # Medium priority for operational alerts
    "Suspicious_User_Agent": 2,
    
    # Low priority alerts (3)
    "SSH::Password_Guessing": 3,
    "FTP::Bruteforcing": 3,
    
    # Default priority (4) for everything else
}

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
    """
    Check if a service is running
    """
    try:
        if service_name == 'zeek':
            # Check if Zeek processes are running using pgrep
            result = subprocess.run(["pgrep", "-f", "zeek"], 
                                   capture_output=True, text=True)
            # If any processes are found, Zeek is running
            return result.returncode == 0 and result.stdout.strip() != ""
        else:
            return False
    except Exception as e:
        logger.error(f"Error checking {service_name} status: {str(e)}")
        return False

def get_elasticsearch_alert_count():
    """
    Get the total count of alerts in Elasticsearch
    """
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_count"
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
        logger.info(f"Total Zeek alerts in Elasticsearch: {count}")
        return count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count: {str(e)}")
        return 0

def get_elasticsearch_alert_count_by_note():
    """Get alert counts grouped by note (attack type)"""
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_search"
        headers = {"Content-Type": "application/json"}
        
        # Use the aggregation query you provided
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
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return 0
        
        result = response.json()
        total_count = result.get('hits', {}).get('total', {}).get('value', 0)
        
        # Log the attack types and their counts
        buckets = result.get('aggregations', {}).get('attack_types', {}).get('buckets', [])
        if buckets:
            logger.info("Attack types distribution:")
            for bucket in buckets:
                attack_type = bucket.get('key', 'Unknown')
                count = bucket.get('doc_count', 0)
                logger.info(f"  - {attack_type}: {count}")
        
        logger.info(f"Total Zeek alerts in Elasticsearch: {total_count}")
        return total_count
    except Exception as e:
        logger.error(f"Error getting Elasticsearch alert count by note: {str(e)}")
        return 0

def get_database_alert_count(orgId: int):
    """
    Get the total count of alerts in the database for this organization
    """
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

def fetch_zeek_alerts(orgId: int):
    """
    Fetch Zeek alerts from Elasticsearch
    """
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_search"
        
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
        
        # Simple query to get all alerts
        query = {
            "size": 1000,
            "query": {
                "match_all": {}
            },
            "sort": [{"@timestamp": "desc"}]
        }
        
        headers = {"Content-Type": "application/json"}
        logger.info(f"Fetching Zeek alerts from {es_url}")
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} Zeek alerts from Elasticsearch")
        
        if len(alerts) > 0:
            logger.info(f"Sample alert: {json.dumps(alerts[0].get('_source', {}), indent=2)}")
        else:
            logger.warning("No alerts found in Elasticsearch")
            
        # Apply IP verification if enabled
        if ENABLE_IP_VERIFICATION:
            return verify_logs(alerts, orgId)
        else:
            logger.info("IP verification disabled - returning all alerts")
            return alerts
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to Elasticsearch: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_zeek_alerts: {str(e)}")
        return []

def fetch_recent_alerts(limit=1000, minutes=5):
    """
    Fetch only the most recent alerts from Elasticsearch within the specified time window.
    
    Args:
        limit: Maximum number of alerts to fetch
        minutes: Only fetch alerts from the last X minutes
    """
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_search"
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

def fetch_zeek_alerts_by_ip(ip_address: str):
    """
    Fetch Zeek alerts from Elasticsearch that involve a specific IP address
    """
    try:
        es_url = "http://localhost:9200/zeek-alerts-*/_search"
        
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
        logger.info(f"Fetching Zeek alerts from {es_url} for IP: {ip_address}")
        response = requests.get(es_url, json=query, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Error from Elasticsearch: {response.status_code} - {response.text}")
            return []
        
        result = response.json()
        alerts = result.get('hits', {}).get('hits', [])
        logger.info(f"Fetched {len(alerts)} Zeek alerts from Elasticsearch for IP: {ip_address}")

        if len(alerts) > 0:
            logger.info(f"Sample alert: {json.dumps(alerts[0].get('_source', {}), indent=2)}")
        else:
            logger.warning(f"No alerts found in Elasticsearch for IP: {ip_address}")
            
        return alerts
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to Elasticsearch: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_zeek_alerts_by_ip: {str(e)}")
        return []

def verify_logs(logs: list, orgId: int):
    """
    Verify logs against the VM IP for this organization
    """
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
    """
    Get a set of existing alert IDs in the database for deduplication
    """
    try:
        results = db.query(
            ZeekAlerts.uid,
            ZeekAlerts.src_ip,
            ZeekAlerts.dest_ip,
            ZeekAlerts.timestamp
        ).filter(
            ZeekAlerts.organization_id == orgId,
            ZeekAlerts.alert_source == "zeek"
        ).all()
        
        # Create a set of tuples for fast lookup
        return {(r.uid, r.src_ip, r.dest_ip, r.timestamp) for r in results}
    except Exception as e:
        logger.error(f"Error getting existing alert IDs: {str(e)}")
        return set()

def is_low_value_alert(note, protocol):
    """
    Check if an alert is a low-value alert based on note and protocol
    """
    # If note is in our list of known low-value alerts
    if note in LOW_VALUE_ALERTS:
        return True
        
    # If note is empty or N/A and protocol is tcp, it's likely a generic TCP alert
    if (not note or note == "N/A" or note.strip() == "") and protocol == "tcp":
        return True
        
    return False

def get_alert_priority(note):
    """
    Get the priority level for an alert based on its note/signature_id
    """
    # Check if we have a specific priority for this alert type
    if note in ALERT_PRIORITIES:
        return ALERT_PRIORITIES[note]
    
    # Check for partial matches (for alerts that start with a known prefix)
    for alert_type, priority in ALERT_PRIORITIES.items():
        if note and alert_type and note.startswith(alert_type):
            return priority
    
    # Default priority (4 - lowest) if no match found
    return 4

def save_zeek_alerts(alerts, orgId: int):
    """
    Save Zeek alerts to the database with organization ID
    """
    try:
        with SessionLocal() as db:
            # Get existing alert IDs for deduplication
            existing_alerts = get_existing_alert_ids(db, orgId)
            
            saved_count = 0
            duplicate_count = 0
            error_count = 0
            filtered_count = 0
            
            # Prepare all alerts before committing for better performance
            alerts_to_add = []
            
            for alert in alerts:
                try:
                    # Extract the source data - Logstash has already done the processing
                    source = alert.get("_source", {})
                    
                    # Get note/signature_id and protocol to check if it's a low-value alert
                    note = source.get("note", "")
                    protocol = source.get("proto", "").lower()
                    
                    # MODIFIED: Skip alerts with N/A or empty note/signature_id
                    if not note or note == "N/A" or note.strip() == "":
                        filtered_count += 1
                        continue
                    
                    # Check if this is a low-value alert
                    if is_low_value_alert(note, protocol):
                        filtered_count += 1
                        continue
                    
                    # Handle src_ip and dest_ip as arrays
                    src_ip = source.get("src_ip", "")
                    if isinstance(src_ip, list) and len(src_ip) > 0:
                        src_ip = src_ip[0]
                        
                    dest_ip = source.get("dest_ip", "")
                    if isinstance(dest_ip, list) and len(dest_ip) > 0:
                        dest_ip = dest_ip[0]
                    
                    # Handle src_port and dest_port as arrays
                    src_port = source.get("src_port", 0)
                    if isinstance(src_port, list) and len(src_port) > 0:
                        src_port = src_port[0]
                        
                    dest_port = source.get("dest_port", 0)
                    if isinstance(dest_port, list) and len(dest_port) > 0:
                        dest_port = dest_port[0]
                    
                    # Get timestamp
                    timestamp = source.get("@timestamp", datetime.now().isoformat())
                    
                    # Get UID
                    uid = source.get("uid", "")
                    
                    # Check if this alert already exists in our set of existing alerts
                    alert_key = (uid, src_ip, dest_ip, timestamp)
                    if alert_key in existing_alerts:
                        duplicate_count += 1
                        continue
                    
                    # Add to our set of existing alerts to prevent duplicates in this batch
                    existing_alerts.add(alert_key)
                    
                    # Get priority based on alert type
                    priority = source.get("priority", get_alert_priority(note))
                    
                    # Create a new alert object
                    db_alert = ZeekAlerts(
                        timestamp=timestamp,
                        priority=priority,
                        protocol=protocol,
                        raw=json.dumps(source),  # Store the full raw alert
                        length=0,
                        direction="->",
                        src_ip=src_ip,
                        src_port=src_port,
                        dest_ip=dest_ip,
                        dest_port=dest_port,
                        signature_id=note,
                        action="ALERT",
                        message=source.get("msg", ""),
                        classification=note,  # Use note as classification
                        host=source.get("host", {}).get("name", ""),
                        alert_source="zeek",
                        conn_id=f"{src_ip}:{src_port}-{dest_ip}:{dest_port}",
                        event_type=source.get("_path", ""),
                        uid=uid,
                        service=source.get("service", ""),
                        organization_id=orgId
                    )
                    
                    # Add to our list of alerts to add
                    alerts_to_add.append(db_alert)
                    saved_count += 1
                except Exception as e:
                    logger.error(f"Error processing alert: {str(e)}")
                    error_count += 1
            
            # Bulk add all alerts at once for better performance
            if alerts_to_add:
                db.add_all(alerts_to_add)
                db.commit()
            
            logger.info(f"Processed {len(alerts)} alerts: {saved_count} saved, {duplicate_count} duplicates, {filtered_count} filtered low-value, {error_count} errors")
    except Exception as e:
        logger.error(f"Error saving Zeek alerts to database: {str(e)}")

def update_and_fetch_zeek_alerts(orgId: int):
    """
    Update alerts if there are new ones in Elasticsearch, and return only alerts for the specified organization
    """
    try:
        # CRITICAL FIX: Validate organization ID
        if not orgId or orgId <= 0:
            logger.error(f"Invalid organization ID: {orgId}")
            return []
            
        logger.info(f"Processing alerts for organization ID: {orgId}")
        
        # Check if Zeek is running (for logging only)
        is_running = is_service_running('zeek')
        logger.info(f"Zeek running status: {is_running}")
        
        # Get the VM's IP for filtering
        vm_ip = get_vm_ip()
        if not vm_ip and ENABLE_IP_VERIFICATION:
            logger.error("Could not determine VM IP address. Skipping alert processing.")
            return []
            
        logger.info(f"Current VM IP: {vm_ip}")
        
        # Check if the VM's IP is in the VerifiedIP table for this organization
        if ENABLE_IP_VERIFICATION:
            with SessionLocal() as db:
                verified_ip = db.query(VerifiedIP).filter_by(
                    organization_id=orgId, 
                    ip=vm_ip, 
                    is_verified=True
                ).first()
                
                # MODIFIED: Removed auto-add functionality
                if not verified_ip:
                    logger.warning(f"VM IP {vm_ip} is not in the verified IP list for organization {orgId}. Skipping alert processing.")
                    return []
        
        # Get counts to determine if we need to sync
        es_count = get_elasticsearch_alert_count()
        db_count = get_database_alert_count(orgId)
        
        # Add this line to get and log attack type distribution
        attack_type_count = get_elasticsearch_alert_count_by_note()
        
        # PERFORMANCE IMPROVEMENT: Only fetch recent alerts (last 5 minutes)
        # This makes the function much faster and more responsive to new attacks
        logger.info(f"Fetching recent alerts for organization {orgId}")
        
        # Import recent alerts (last 5 minutes)
        force_import_alerts(orgId, limit=1000, minutes=5)
        
        # Now retrieve all alerts for this organization from the database
        with SessionLocal() as db:
            # CRITICAL FIX: Only return alerts that match the VM's IP if verification is enabled
            if ENABLE_IP_VERIFICATION and vm_ip:
                logger.info(f"Filtering database alerts by VM IP: {vm_ip}")
                
                # MODIFIED: Filter out ANY alerts with N/A, empty, or null signature_id
                org_alerts = db.query(ZeekAlerts).filter(
                    ZeekAlerts.organization_id == orgId,
                    ZeekAlerts.alert_source == "zeek",
                    or_(ZeekAlerts.src_ip == vm_ip, ZeekAlerts.dest_ip == vm_ip),
                    # Filter out known low-value alerts
                    ~ZeekAlerts.signature_id.in_(LOW_VALUE_ALERTS),
                    # Filter out ANY alerts with N/A, empty, or null signature_id
                    ~((ZeekAlerts.signature_id == "") | 
                      (ZeekAlerts.signature_id == "N/A") | 
                      (ZeekAlerts.signature_id == None))
                ).all()
            else:
                # MODIFIED: Filter out ANY alerts with N/A, empty, or null signature_id
                org_alerts = db.query(ZeekAlerts).filter(
                    ZeekAlerts.organization_id == orgId,
                    ZeekAlerts.alert_source == "zeek",
                    # Filter out known low-value alerts
                    ~ZeekAlerts.signature_id.in_(LOW_VALUE_ALERTS),
                    # Filter out ANY alerts with N/A, empty, or null signature_id
                    ~((ZeekAlerts.signature_id == "") | 
                      (ZeekAlerts.signature_id == "N/A") | 
                      (ZeekAlerts.signature_id == None))
                ).all()
            
            logger.info(f"Returning {len(org_alerts)} Zeek alerts from DB for org {orgId} (filtered out N/A categories)")
            
            # Add this to debug empty results
            if not org_alerts:
                logger.warning(f"No alerts found in database for organization {orgId}")
            
            return org_alerts
    except Exception as e:
        logger.error(f"Error in update_and_fetch_zeek_alerts: {str(e)}")
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
                
                # MODIFIED: Removed auto-add functionality
                if not verified_ip:
                    logger.warning(f"VM IP {vm_ip} is not in the verified IP list for organization {orgId}. Skipping alert processing.")
                    return False
        
        # Fetch recent alerts (from the last X minutes)
        alerts = fetch_recent_alerts(limit=limit, minutes=minutes)
        
        if not alerts:
            logger.warning("No recent alerts found in Elasticsearch")
            return False
            
        logger.info(f"Processing {len(alerts)} recent alerts")
        
        # Filter out low-value alerts
        filtered_alerts = []
        filtered_count = 0
        
        for alert in alerts:
            source = alert.get("_source", {})
            note = source.get("note", "")
            protocol = source.get("proto", "").lower()
            
            # MODIFIED: Skip alerts with N/A or empty note/signature_id
            if not note or note == "N/A" or note.strip() == "":
                filtered_count += 1
                continue
            
            # Check if this is a low-value alert
            if is_low_value_alert(note, protocol):
                filtered_count += 1
                continue
                
            filtered_alerts.append(alert)
        
        logger.info(f"Filtered out {filtered_count} low-value alerts, {len(filtered_alerts)} remaining")
        alerts = filtered_alerts
        
        # If IP verification is enabled, filter alerts by VM IP
        if ENABLE_IP_VERIFICATION and vm_ip:
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
                # Extract UIDs, source IPs, destination IPs, and timestamps from the alerts
                alert_keys = []
                for alert in alerts:
                    source = alert.get("_source", {})
                    uid = source.get("uid", "")
                    
                    src_ip = source.get("src_ip", "")
                    if isinstance(src_ip, list) and len(src_ip) > 0:
                        src_ip = src_ip[0]
                        
                    dest_ip = source.get("dest_ip", "")
                    if isinstance(dest_ip, list) and len(dest_ip) > 0:
                        dest_ip = dest_ip[0]
                        
                    timestamp = source.get("@timestamp", "")
                    
                    alert_keys.append((uid, src_ip, dest_ip, timestamp))
                
                # Query for existing alerts with the same uid, src_ip, dest_ip, and timestamp
                if alert_keys:
                    # Use batching to avoid too large queries
                    batch_size = 100
                    all_existing_alerts = set()
                    
                    for i in range(0, len(alert_keys), batch_size):
                        batch = alert_keys[i:i+batch_size]
                        
                        existing_alerts_query = db.query(ZeekAlerts).filter(
                            or_(*[
                                and_(
                                    ZeekAlerts.uid == key[0],
                                    ZeekAlerts.src_ip == key[1],
                                    ZeekAlerts.dest_ip == key[2],
                                    ZeekAlerts.timestamp == key[3]
                                ) for key in batch
                            ])
                        ).all()
                        
                        for alert in existing_alerts_query:
                            all_existing_alerts.add((
                                alert.uid,
                                alert.src_ip,
                                alert.dest_ip,
                                alert.timestamp
                            ))
                
                # Filter out alerts that already exist in ANY organization
                filtered_alerts = []
                for alert in alerts:
                    source = alert.get("_source", {})
                    uid = source.get("uid", "")
                    
                    src_ip = source.get("src_ip", "")
                    if isinstance(src_ip, list) and len(src_ip) > 0:
                        src_ip = src_ip[0]
                        
                    dest_ip = source.get("dest_ip", "")
                    if isinstance(dest_ip, list) and len(dest_ip) > 0:
                        dest_ip = dest_ip[0]
                        
                    timestamp = source.get("@timestamp", "")
                    
                    if (uid, src_ip, dest_ip, timestamp) not in all_existing_alerts:
                        filtered_alerts.append(alert)
                
                logger.info(f"After filtering out existing alerts: {len(filtered_alerts)} of {len(alerts)} alerts remaining")
                alerts = filtered_alerts
        
        # Save the alerts to the database
        if alerts:
            # Use batch processing for saving alerts
            batch_size = 100
            total_saved = 0
            
            for i in range(0, len(alerts), batch_size):
                batch = alerts[i:i+batch_size]
                save_zeek_alerts(batch, orgId)
                total_saved += len(batch)
                logger.info(f"Saved batch {i//batch_size + 1}: {len(batch)} alerts")
            
            logger.info(f"Total imported: {total_saved} alerts to database for organization {orgId}")
            
            # Verify alerts were saved
            with SessionLocal() as db:
                count = db.query(func.count(ZeekAlerts.id)).filter(
                    ZeekAlerts.organization_id == orgId,
                    ZeekAlerts.alert_source == "zeek"
                ).scalar()
                
            logger.info(f"After import: {count} alerts in database for org {orgId}")
            return True
        else:
            logger.warning("No new alerts found to import")
            return False
            
    except Exception as e:
        logger.error(f"Error importing alerts: {str(e)}")
        return False

def check_database_alerts(orgId: int):
    """
    Utility function to check alerts in the database for a specific organization.
    """
    try:
        with SessionLocal() as db:
            # MODIFIED: Filter out ANY alerts with N/A, empty, or null signature_id
            alerts = db.query(ZeekAlerts).filter(
                ZeekAlerts.organization_id == orgId,
                ZeekAlerts.alert_source == "zeek",
                # Filter out known low-value alerts
                ~ZeekAlerts.signature_id.in_(LOW_VALUE_ALERTS),
                # Filter out ANY alerts with N/A, empty, or null signature_id
                ~((ZeekAlerts.signature_id == "") | 
                  (ZeekAlerts.signature_id == "N/A") | 
                  (ZeekAlerts.signature_id == None))
            ).all()
            
            logger.info(f"Found {len(alerts)} Zeek alerts in database for org {orgId} (excluding N/A categories)")
            
            if alerts:
                logger.info("Sample alert from database:")
                sample = alerts[0]
                logger.info(f"ID: {sample.id}")
                logger.info(f"Timestamp: {sample.timestamp}")
                logger.info(f"Message: {sample.message}")
                logger.info(f"Source IP: {sample.src_ip}")
                logger.info(f"Destination IP: {sample.dest_ip}")
                logger.info(f"Priority: {sample.priority}")
            else:
                logger.info("No alerts found in database")
                
            return alerts
    except Exception as e:
        logger.error(f"Error checking database: {e}")
        return []