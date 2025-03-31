from database import SessionLocal
from models.models import Playbook
from models.schemas import PlaybookBase, PlaybookOut
from models.schemas import IPAddressSchema
from typing import List, Optional
from fastapi import HTTPException
import uuid
from services.organization_service import ensure_default_organization, DEFAULT_ORG_ID
from services.ip_blocking_service import block_ip
from services.email_service import send_email
from sqlalchemy.sql import text

def get_all_playbooks() -> List[PlaybookOut]:
    with SessionLocal() as db:
        playbooks = db.query(Playbook).all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]

def add_playbook(playbook_data: PlaybookBase, organization_id: uuid.UUID = DEFAULT_ORG_ID) -> PlaybookOut:
    with SessionLocal() as db:
        # Ensure default organization exists
        ensure_default_organization()
        
        # Check if playbook with same name exists
        existing = db.query(Playbook).filter(Playbook.name == playbook_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        db_playbook = Playbook(
            organization_id=organization_id,
            **playbook_data.model_dump()
        )
        db.add(db_playbook)
        db.commit()
        db.refresh(db_playbook)
        return PlaybookOut.model_validate(db_playbook)

def delete_playbook(playbook_id: int) -> bool:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if playbook:
            db.delete(playbook)
            db.commit()
            return True
        return False

def update_playbook(playbook_id: int, update_data: PlaybookBase) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if not playbook:
            return None

        # Check if updated name conflicts with existing playbook
        if update_data.name != playbook.name:
            existing = db.query(Playbook).filter(Playbook.name == update_data.name).first()
            if existing:
                raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        for key, value in update_data.model_dump().items():
            setattr(playbook, key, value)

        db.commit()
        db.refresh(playbook)
        return PlaybookOut.model_validate(playbook)

def toggle_playbook_status(playbook_id: int) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if not playbook:
            return None

        playbook.is_active = not playbook.is_active
        db.commit()
        db.refresh(playbook)
        return PlaybookOut.model_validate(playbook)

def get_active_playbooks() -> List[PlaybookOut]:
    with SessionLocal() as db:
        playbooks = db.query(Playbook).filter(Playbook.is_active == True).all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]
    
def check_ip_alerts(threshold: int, interval_minutes: int):
    with SessionLocal() as db:
        query = text(f"""
        WITH time_windows AS (
            SELECT 
                generate_series(
                    (SELECT MIN(timestamp)::timestamp FROM "SnortAlerts"),  
                    (SELECT MAX(timestamp)::timestamp FROM "SnortAlerts"),  
                    INTERVAL '1 minute' * {interval_minutes}  
                ) AS window_start
        )
        SELECT 
            s.src_ip,
            t.window_start,
            COUNT(*) AS alert_count
        FROM "SnortAlerts" s
        JOIN time_windows t
            ON s.timestamp BETWEEN t.window_start AND t.window_start + INTERVAL '{interval_minutes} minutes'
        GROUP BY s.src_ip, t.window_start
        HAVING COUNT(*) >= {threshold}
        ORDER BY t.window_start DESC;
        """)
        result = db.execute(query).fetchall()
        return result

def check_and_block_ips(threshold: int, interval_minutes: int):
    alerts = check_ip_alerts(threshold, interval_minutes)
    if alerts:
        for alert in alerts:
            ip = alert[0]
            reason = f"Detected {alert[2]} alerts in {interval_minutes} minutes"
            ip_data = IPAddressSchema(ip=ip, reason=reason)
            block_ip(ip_data)
    return alerts

def check_international_blacklist() -> List[str]:
    """
    Checks if the source IP address of any SnortAlert is part of the international blacklist.
    Returns a list of blacklisted IPs found in SnortAlerts.
    """
    with SessionLocal() as db:
        query =  text("""
        SELECT DISTINCT s.src_ip
        FROM "SnortAlerts" s
        JOIN international_blacklist b
        ON s.src_ip = b.ip;
        """)        
        result = db.execute(query).fetchall()
        return [row[0] for row in result]

def check_internations_blacklist_and_block_ips():
    ips_to_block = check_international_blacklist()
    if ips_to_block:
        for ip in ips_to_block:
            ip_data = IPAddressSchema(ip=ip, reason="International blacklist")
            block_ip(ip_data)

    return ips_to_block

def check_exceed_severity_level(severity: str) -> List[str]:
    """
    Returns all source IP addresses of threats that exceed the specified severity level.
    Severity levels: "low", "medium", "high", "critical".
    """
    severity_mapping = {
        "low": 1,
        "medium": 2,
        "high": 3,
        "critical": 4
    }

    if severity not in severity_mapping:
        print('severity '+ severity)
        raise ValueError("Invalid severity level. Choose from 'low', 'medium', 'high', or 'critical'.")

    min_priority = severity_mapping[severity.lower()]

    with SessionLocal() as db:
        query = text("""
        SELECT DISTINCT s.src_ip
        FROM "SnortAlerts" s
        JOIN priority_classification p
        ON s.classification = p.classification
        WHERE p.priority >= :min_priority;
        """)
        result = db.execute(query, {"min_priority": min_priority}).fetchall()
        return [row[0] for row in result]
def check_exceed_severity_level_and_block_ip(severity: str):
    ips_to_block = check_exceed_severity_level(severity)
    if ips_to_block:
        for ip in ips_to_block:
            ip_data = IPAddressSchema(ip=ip, reason=f"Exceeded severity level: {severity}")
            block_ip(ip_data)

    return ips_to_block

def check_classtype(classType: str) -> List[str]:
    """
    Returns all source IP addresses of threats that match the specified classtype.
    """
    with SessionLocal() as db:
        query = text("""
        SELECT DISTINCT s.src_ip
        FROM "SnortAlerts" s
        WHERE s.classification = :classtype;
        """)
        result = db.execute(query, {"classtype": classType}).fetchall()
        return [row[0] for row in result]

def check_classtype_and_block_ip(classType: str):
    ips_to_block = check_classtype(classType)
    if ips_to_block:
        for ip in ips_to_block:
            ip_data = IPAddressSchema(ip=ip, reason=f"Matched classtype: {classType}")
            block_ip(ip_data)
    return ips_to_block 


def execute_playbook_rules():
    print("executing")
    """
    Iterates over all active playbooks and evaluates their conditions.
    If all conditions in a playbook are met, the specified actions are executed.
    """
    try:
        with SessionLocal() as db:
            active_playbooks = db.query(Playbook).filter(Playbook.is_active == True).all()

            for playbook in active_playbooks:
                conditions = playbook.conditions
                actions = playbook.actions

                # Parse conditions and actions
                if not conditions:
                    continue

                ips_to_block = set()

                for condition in conditions:
                    condition_type = condition.get("condition_type")
                    field = condition.get("field")
                    operator = condition.get("operator")
                    value = condition.get("value")
                    window_period = condition.get("window_period", 0)

                    if condition_type == "threshold" and field == "source_ip_alert_count":
                        threshold = int(value)
                        interval_minutes = int(window_period) if window_period else 1
                        alerts = check_ip_alerts(threshold, interval_minutes)
                        ips_to_block.update(alert[0] for alert in alerts)

                    elif condition_type == "severity" and field == "severity":
                        print("i am printing it now ...." + value)
                        print("conditions " + str(condition))
                        severity = value
                        ips = check_exceed_severity_level(severity)
                        ips_to_block.update(ips)

                    elif condition_type == "class_type" and field == "class_type":
                        class_type = value
                        ips = check_classtype(class_type)
                        ips_to_block.update(ips)

                    elif condition_type == "ip_reputation" and field == "source_ip" and operator == "exists":
                        ips = check_international_blacklist()
                        ips_to_block.update(ips)

                # If multiple conditions exist, ensure all are met
                if len(conditions) > 1:
                    for condition in conditions:
                        condition_type = condition.get("condition_type")
                        field = condition.get("field")
                        operator = condition.get("operator")
                        value = condition.get("value")
                        window_period = condition.get("window_period", 0)

                        if condition_type == "threshold" and field == "source_ip_alert_count":
                            threshold = int(value)
                            interval_minutes = int(window_period) if window_period else 1
                            alerts = check_ip_alerts(threshold, interval_minutes)
                            condition_ips = set(alert[0] for alert in alerts)

                        elif condition_type == "severity" and field == "severity":
                            severity = value
                            condition_ips = set(check_exceed_severity_level(severity))

                        elif condition_type == "class_type" and field == "class_type":
                            class_type = value
                            condition_ips = set(check_classtype(class_type))

                        elif condition_type == "ip_reputation" and field == "source_ip" and operator == "exists":
                            condition_ips = set(check_international_blacklist())

                        # Intersect with existing IPs to ensure all conditions are met
                        ips_to_block.intersection_update(condition_ips)

                # Consolidate IPs for email alert
                if actions.get("sendEmailAlert"):
                    recipients = actions.get("emailRecipients", "")
                    if recipients and ips_to_block:
                        recipient_list = [email.strip() for email in recipients.split(",")]
                        ip_list = ", ".join(ips_to_block)
                        message = f"Playbook '{playbook.name}' triggered actions for the following IPs: {ip_list}"
                        subject = f"Alert from Playbook: {playbook.name}"
                        send_email(recipient_list, message, subject)

                # Execute blockIP action for each IP
                if actions.get("blockIP") and ips_to_block:
                    for ip in ips_to_block:
                        print("ip is getting blocked")
                        ip_data = IPAddressSchema(ip=ip, reason=f"Blocked by playbook: {playbook.name}")
                        block_ip(ip_data)
        return True
    except Exception as e:
        # Log the exception if needed
        print(f"Error executing playbook rules: {e}")
        return False
