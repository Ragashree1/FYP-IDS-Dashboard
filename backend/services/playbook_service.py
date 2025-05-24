from database import SessionLocal
from models.models import Playbook, VerifiedIP
from models.schemas import PlaybookBase, PlaybookOut, SystemLogBase
from models.schemas import IPAddressSchema
from typing import List, Optional
from fastapi import HTTPException
import uuid
from services.organization_service import ensure_default_organization, DEFAULT_ORG_ID
from services.ip_blocking_service import block_ip
from services.email_service import send_email
from services import system_audit_service
from sqlalchemy.sql import text

def get_all_playbooks() -> List[PlaybookOut]:
    with SessionLocal() as db:
        playbooks = db.query(Playbook).all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]

def add_playbook(playbook_data: PlaybookBase, organization_id: int = DEFAULT_ORG_ID, current_user: str = "system") -> PlaybookOut:
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

        # Log the playbook creation in system logs
        log_data = SystemLogBase(
            user=current_user,
            component="Playbook",
            action="playbook_created",
            description=f"Created new playbook: {db_playbook.name}",
            resourceId=str(db_playbook.id),
            resourceName=db_playbook.name,
            organization_id=organization_id
        )
        system_audit_service.add_system_log(log_data)
        
        return PlaybookOut.model_validate(db_playbook)

def delete_playbook(playbook_id: int, organization_id: int = DEFAULT_ORG_ID, current_user: str = "system") -> bool:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if playbook:
            playbook_name = playbook.name  # Store name before deletion
            db.delete(playbook)
            db.commit()

            # Log the playbook deletion in system logs
            log_data = SystemLogBase(
                user=current_user,
                component="Playbook",
                action="playbook_deleted",
                description=f"Deleted playbook: {playbook_name}",
                resourceId=str(playbook_id),
                resourceName=playbook_name,
                organization_id=organization_id
            )
            system_audit_service.add_system_log(log_data)
            return True
        return False

def update_playbook(playbook_id: int, update_data: PlaybookBase, organization_id: int = DEFAULT_ORG_ID, current_user: str = "system") -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if not playbook:
            return None

        # Check if updated name conflicts with existing playbook
        if update_data.name != playbook.name:
            existing = db.query(Playbook).filter(Playbook.name == update_data.name).first()
            if existing:
                raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        old_name = playbook.name  # Store old name for logging
        for key, value in update_data.model_dump().items():
            setattr(playbook, key, value)

        db.commit()
        db.refresh(playbook)

        # Log the playbook update in system logs
        log_data = SystemLogBase(
            user=current_user,
            component="Playbook",
            action="playbook_updated",
            description=f"Updated playbook '{playbook.name}'",
            resourceId=str(playbook_id),
            resourceName=playbook.name,
            organization_id=organization_id
        )
        system_audit_service.add_system_log(log_data)

        return PlaybookOut.model_validate(playbook)

def toggle_playbook_status(playbook_id: int, organization_id: int = DEFAULT_ORG_ID, current_user: str = "system") -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if not playbook:
            return None

        playbook.is_active = not playbook.is_active
        new_status = "activated" if playbook.is_active else "deactivated"
        
        db.commit()
        db.refresh(playbook)

        # Log the playbook status change in system logs
        log_data = SystemLogBase(
            user=current_user,
            component="Playbook",
            action="playbook_status_changed",
            description=f"{new_status.capitalize()} playbook: {playbook.name}",
            resourceId=str(playbook_id),
            resourceName=playbook.name,
            organization_id=organization_id
        )
        system_audit_service.add_system_log(log_data)

        return PlaybookOut.model_validate(playbook)

def get_active_playbooks() -> List[PlaybookOut]:
    with SessionLocal() as db:
        playbooks = db.query(Playbook).filter(Playbook.is_active == True).all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]
        
def check_ip_alerts_by_organization(threshold: int, interval_minutes: int, organization_id: int):
    with SessionLocal() as db:
        query = text(f"""
        WITH time_windows AS (
            SELECT 
                generate_series(
                    (
                        SELECT MIN(timestamp)::timestamp 
                        FROM (
                            SELECT timestamp FROM "SnortAlerts" WHERE organization_id = :organization_id
                            UNION ALL
                            SELECT timestamp::timestamp FROM "ZeekAlerts" WHERE organization_id = :organization_id
                            UNION ALL
                            SELECT timestamp::timestamp FROM "SuricataAlerts" WHERE organization_id = :organization_id
                        ) AS combined_timestamps
                    ),
                    (
                        SELECT MAX(timestamp)::timestamp 
                        FROM (
                            SELECT timestamp FROM "SnortAlerts" WHERE organization_id = :organization_id
                            UNION ALL
                            SELECT timestamp::timestamp FROM "ZeekAlerts" WHERE organization_id = :organization_id
                            UNION ALL
                            SELECT timestamp::timestamp FROM "SuricataAlerts" WHERE organization_id = :organization_id
                        ) AS combined_timestamps
                    ),
                    INTERVAL '1 minute' * {interval_minutes}
                ) AS window_start
        ),
        combined_alerts AS (
            SELECT src_ip AS ip, timestamp::timestamp, 'snort' as source
            FROM "SnortAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, timestamp::timestamp, 'snort' as source
            FROM "SnortAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT src_ip AS ip, timestamp::timestamp, 'zeek' as source
            FROM "ZeekAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, timestamp::timestamp, 'zeek' as source
            FROM "ZeekAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT src_ip AS ip, timestamp::timestamp, 'suricata' as source
            FROM "SuricataAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, timestamp::timestamp, 'suricata' as source
            FROM "SuricataAlerts"
            WHERE organization_id = :organization_id
        )
        SELECT 
            a.ip,
            t.window_start,
            COUNT(*) AS alert_count,
            array_agg(DISTINCT a.source) as alert_sources
        FROM combined_alerts a
        JOIN time_windows t
            ON a.timestamp BETWEEN t.window_start AND t.window_start + INTERVAL '{interval_minutes} minutes'
        GROUP BY a.ip, t.window_start
        HAVING COUNT(*) >= {threshold}
        ORDER BY t.window_start DESC;
        """)
        result = db.execute(query, {"organization_id": organization_id}).fetchall()
        return result


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

def check_exceed_severity_level_by_organization(severity: str, organization_id: int) -> List[str]:
    """
    Returns all IP addresses (source and destination) of threats that exceed the specified severity level
    for a given organization across Snort, Zeek, and Suricata alerts.
    Args:
        severity (str): The severity level to check ("low", "medium", "high", "critical")
        organization_id (int): The ID of the organization to filter alerts
    Returns:
        List[str]: List of IP addresses (source and destination) that exceed the severity level
    """
    severity_mapping = {
        "low": 1,
        "medium": 2,
        "high": 3,
        "critical": 4
    }

    if severity not in severity_mapping:
        print('severity ' + severity)
        raise ValueError("Invalid severity level. Choose from 'low', 'medium', 'high', or 'critical'.")

    min_priority = severity_mapping[severity.lower()]

    with SessionLocal() as db:
        query = text("""
        WITH combined_alerts AS (
            SELECT src_ip AS ip, classification, 'snort' as source
            FROM "SnortAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, classification, 'snort' as source
            FROM "SnortAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT src_ip AS ip, classification, 'zeek' as source
            FROM "ZeekAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, classification, 'zeek' as source
            FROM "ZeekAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT src_ip AS ip, classification, 'suricata' as source
            FROM "SuricataAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, classification, 'suricata' as source
            FROM "SuricataAlerts"
            WHERE organization_id = :organization_id
        )
        SELECT DISTINCT a.ip
        FROM combined_alerts a
        JOIN priority_classification p
        ON a.classification = p.classification
        WHERE p.priority >= :min_priority;
        """)
        result = db.execute(query, {
            "min_priority": min_priority,
            "organization_id": organization_id
        }).fetchall()
        return [row[0] for row in result]

def check_classtype_by_organization(classType: str, organization_id: int) -> List[str]:
    """
    Returns all IP addresses (source and destination) of threats that match the specified classtype
    for a given organization across Snort, Zeek, and Suricata alerts.
    Args:
        classType (str): The classification type to check
        organization_id (int): The ID of the organization to filter alerts
    Returns:
        List[str]: List of IP addresses (source and destination) that match the classtype
    """
    with SessionLocal() as db:
        query = text("""
        WITH combined_alerts AS (
            SELECT src_ip AS ip, classification, 'snort' as source
            FROM "SnortAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, classification, 'snort' as source
            FROM "SnortAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT src_ip AS ip, classification, 'zeek' as source
            FROM "ZeekAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, classification, 'zeek' as source
            FROM "ZeekAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT src_ip AS ip, classification, 'suricata' as source
            FROM "SuricataAlerts"
            WHERE organization_id = :organization_id
            UNION ALL
            SELECT dest_ip AS ip, classification, 'suricata' as source
            FROM "SuricataAlerts"
            WHERE organization_id = :organization_id
        )
        SELECT DISTINCT ip
        FROM combined_alerts
        WHERE classification = :classtype;
        """)
        result = db.execute(query, {
            "classtype": classType,
            "organization_id": organization_id
        }).fetchall()
        return [row[0] for row in result]

def execute_playbook_rules():
    print("Executing playbook rules...")
    try:
        with SessionLocal() as db:
            active_playbooks = db.query(Playbook).filter(Playbook.is_active == True).all()
            print(f"Found {len(active_playbooks)} active playbooks.")

            for playbook in active_playbooks:
                print(f"\nEvaluating playbook: {playbook.name} (ID: {playbook.id})")
                conditions = playbook.conditions
                actions = playbook.actions
                organization_id = playbook.organization_id

                print(f"Conditions: {conditions}")
                print(f"Actions: {actions}")
                print(f"Organization ID: {organization_id}")

                if not conditions:
                    print("No conditions found, skipping playbook.")
                    continue

                ips_to_block = set()

                for condition in conditions:
                    print(f"Evaluating condition: {condition}")
                    condition_type = condition.get("condition_type")
                    field = condition.get("field")
                    operator = condition.get("operator")
                    value = condition.get("value")
                    window_period = condition.get("window_period", 0)

                    if condition_type == "threshold" and field == "source_ip_alert_count":
                        threshold = int(value)
                        interval_minutes = int(window_period) if window_period else 1
                        alerts = check_ip_alerts_by_organization(threshold, interval_minutes, organization_id)
                        print(f"Threshold alerts found: {alerts}")
                        ips_to_block.update(alert[0] for alert in alerts)

                    elif condition_type == "severity" and field == "severity":
                        print(f"Checking severity: {value}")
                        ips = check_exceed_severity_level_by_organization(value, organization_id)
                        print(f"IPs exceeding severity '{value}': {ips}")
                        ips_to_block.update(ips)

                    elif condition_type == "class_type" and field == "class_type":
                        print(f"Checking class type: {value}")
                        ips = check_classtype_by_organization(value, organization_id)
                        print(f"IPs matching class type '{value}': {ips}")
                        ips_to_block.update(ips)

                    elif condition_type == "ip_reputation" and field == "source_ip" and operator == "exists":
                        print("Checking international blacklist...")
                        ips = check_international_blacklist()
                        print(f"IPs in international blacklist: {ips}")
                        ips_to_block.update(ips)

                # If multiple conditions exist, ensure all are met
                if len(conditions) > 1:
                    print("Multiple conditions detected, intersecting IPs...")
                    for condition in conditions:
                        print(f"Intersecting for condition: {condition}")
                        condition_type = condition.get("condition_type")
                        field = condition.get("field")
                        operator = condition.get("operator")
                        value = condition.get("value")
                        window_period = condition.get("window_period", 0)

                        if condition_type == "threshold" and field == "source_ip_alert_count":
                            threshold = int(value)
                            interval_minutes = int(window_period) if window_period else 1
                            alerts = check_ip_alerts_by_organization(threshold, interval_minutes, organization_id)
                            condition_ips = set(alert[0] for alert in alerts)
                            print(f"Threshold condition IPs: {condition_ips}")

                        elif condition_type == "severity" and field == "severity":
                            condition_ips = set(check_exceed_severity_level_by_organization(value, organization_id))
                            print(f"Severity condition IPs: {condition_ips}")

                        elif condition_type == "class_type" and field == "class_type":
                            condition_ips = set(check_classtype_by_organization(value, organization_id))
                            print(f"Class type condition IPs: {condition_ips}")

                        elif condition_type == "ip_reputation" and field == "source_ip" and operator == "exists":
                            condition_ips = set(check_international_blacklist())
                            print(f"IP reputation condition IPs: {condition_ips}")

                        ips_to_block.intersection_update(condition_ips)
                        print(f"IPs to block after intersection: {ips_to_block}")

               # Filter out verified IPs
                verified_ips = db.query(VerifiedIP).filter(
                    VerifiedIP.organization_id == organization_id,
                    VerifiedIP.ip.in_(ips_to_block)
                ).with_entities(VerifiedIP.ip).all()

                # Convert verified IPs to a set for exclusion
                verified_ips_set = {ip[0] for ip in verified_ips}
                print(f"Verified IPs to exclude: {verified_ips_set}")

                # Ensure verified IPs are excluded from the blocklist
                ips_to_block = ips_to_block - verified_ips_set
                print(f"Final IPs to block (after excluding verified): {ips_to_block}")

                # Debugging: Check if any verified IPs are still in the blocklist
                intersection = ips_to_block.intersection(verified_ips_set)
                if intersection:
                    print(f"ERROR: Verified IPs still in blocklist: {intersection}")

                # Consolidate IPs for email alert (only non-verified IPs)
                if actions.get("sendEmailAlert"):
                    recipients = actions.get("emailRecipients", "")
                    if recipients and ips_to_block:
                        recipient_list = [email.strip() for email in recipients.split(",")]
                        ip_list = ", ".join(ips_to_block)
                        message = f"Playbook '{playbook.name}' triggered actions for the following IPs: {ip_list}"
                        subject = f"Alert from Playbook: {playbook.name}"
                        print(f"Sending email to {recipient_list} with subject '{subject}' and message: {message}")
                        send_email(recipient_list, message, subject)

                # Execute blockIP action for each non-verified IP
                if actions.get("blockIP") and ips_to_block:
                    for ip in ips_to_block:
                        print(f"Blocking IP: {ip} for playbook: {playbook.name}, organization_id: {organization_id}")
                        block_ip(ip, f"Blocked by playbook: {playbook.name}, organization_id: {organization_id}", organization_id)
        print("Playbook rule execution complete.")
        return True
    except Exception as e:
        print(f"Error executing playbook rules: {e}")
        return False