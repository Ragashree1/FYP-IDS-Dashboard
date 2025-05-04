from database import SessionLocal
from models.models import Playbook
from models.schemas import PlaybookBase, PlaybookOut
from models.schemas import IPAddressSchema
from typing import List, Optional
from fastapi import HTTPException
import uuid
from services.ip_blocking_service import block_ip
from services.email_service import send_email
from sqlalchemy import text, inspect

def get_all_playbooks(company_name: str = None) -> List[PlaybookOut]:
    """Get all playbooks, optionally filtered by company name"""
    with SessionLocal() as db:
        # First, let's determine the actual table name for organizations
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        org_table_name = None
        for name in table_names:
            if name.lower() == 'organizations':
                org_table_name = name
                break
        
        if company_name and hasattr(Playbook, 'organization_id') and org_table_name:
            # Use raw SQL with explicit type casting to handle UUID vs integer comparison
            query = text(f"""
                SELECT p.* FROM "Playbooks" p
                JOIN "{org_table_name}" o ON p.organization_id::text = o.id::text
                WHERE o.name = :company_name
            """)
            result = db.execute(query, {"company_name": company_name})
            playbooks = []
            for row in result:
                # Convert row to dict
                playbook_dict = {column: value for column, value in row._mapping.items()}
                playbook = Playbook(**playbook_dict)
                playbooks.append(playbook)
            return [PlaybookOut.model_validate(playbook) for playbook in playbooks]
        else:
            query = db.query(Playbook)
            if company_name and hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            
            playbooks = query.all()
            return [PlaybookOut.model_validate(playbook) for playbook in playbooks]

def get_playbook_by_id(playbook_id: int, company_name: str = None) -> Optional[PlaybookOut]:
    """Get a playbook by its ID"""
    with SessionLocal() as db:
        # Determine the actual table name for organizations
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        org_table_name = None
        for name in table_names:
            if name.lower() == 'organizations':
                org_table_name = name
                break
                
        if company_name and hasattr(Playbook, 'organization_id') and org_table_name:
            # Use raw SQL with explicit type casting to handle UUID vs integer comparison
            query = text(f"""
                SELECT p.* FROM "Playbooks" p
                JOIN "{org_table_name}" o ON p.organization_id::text = o.id::text
                WHERE p.id = :playbook_id AND o.name = :company_name
            """)
            result = db.execute(query, {"playbook_id": playbook_id, "company_name": company_name})
            row = result.fetchone()
            if row:
                # Convert row to dict
                playbook_dict = {column: value for column, value in row._mapping.items()}
                playbook = Playbook(**playbook_dict)
                return PlaybookOut.model_validate(playbook)
            return None
        else:
            query = db.query(Playbook).filter(Playbook.id == playbook_id)
            if company_name and hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
                
            playbook = query.first()
            if playbook:
                return PlaybookOut.model_validate(playbook)
            return None

def add_playbook(playbook_data: PlaybookBase, company_name: str = None) -> PlaybookOut:
    with SessionLocal() as db:
        # Determine the actual table name for organizations
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        org_table_name = None
        for name in table_names:
            if name.lower() == 'organizations':
                org_table_name = name
                break
        
        # Check if playbook with same name exists for this company
        if company_name and hasattr(Playbook, 'organization_id') and org_table_name:
            # Use raw SQL with explicit type casting to handle UUID vs integer comparison
            query = text(f"""
                SELECT p.* FROM "Playbooks" p
                JOIN "{org_table_name}" o ON p.organization_id::text = o.id::text
                WHERE p.name = :playbook_name AND o.name = :company_name
            """)
            result = db.execute(query, {"playbook_name": playbook_data.name, "company_name": company_name})
            existing = result.fetchone()
            
            if existing:
                raise HTTPException(status_code=400, detail="Playbook with this name already exists")
        else:
            query = db.query(Playbook).filter(Playbook.name == playbook_data.name)
            if company_name and hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
                
            existing = query.first()
            if existing:
                raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        # Create a dictionary from the playbook_data
        playbook_dict = playbook_data.model_dump()
        
        # Add company_name or organization_id to the dictionary
        db_playbook = None
        if hasattr(Playbook, 'company_name') and company_name:
            db_playbook = Playbook(
                company_name=company_name,
                **playbook_dict
            )
        elif hasattr(Playbook, 'organization_id') and company_name and org_table_name:
            # Get organization_id from company_name using raw SQL
            org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
            org_result = db.execute(org_query, {"name": company_name})
            org = org_result.fetchone()
            
            if not org:
                # Create organization if it doesn't exist
                # Check if the id column is UUID or integer
                columns = inspector.get_columns(org_table_name)
                id_type = None
                for col in columns:
                    if col['name'] == 'id':
                        id_type = col['type']
                        break
                
                # Generate appropriate ID based on column type
                if str(id_type).lower().find('uuid') >= 0:
                    org_id = uuid.uuid4()
                else:
                    # Use an integer ID
                    import random
                    org_id = random.randint(1000000, 9999999)
                
                # Insert the organization using raw SQL
                db.execute(
                    text(f'INSERT INTO "{org_table_name}" (id, name) VALUES (:id, :name)'),
                    {"id": org_id, "name": company_name}
                )
                db.commit()
                
                # Get the new organization ID
                org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
                org_result = db.execute(org_query, {"name": company_name})
                org = org_result.fetchone()
            
            # Use the organization ID directly without conversion
            org_id = org[0]
            
            # Create the playbook with the organization ID
            db_playbook = Playbook(
                organization_id=org_id,
                **playbook_dict
            )
        else:
            # If neither company_name nor organization_id exists, just create the playbook
            db_playbook = Playbook(**playbook_dict)
            
        db.add(db_playbook)
        db.commit()
        db.refresh(db_playbook)
        return PlaybookOut.model_validate(db_playbook)

def delete_playbook(playbook_id: int, company_name: str = None) -> bool:
    with SessionLocal() as db:
        # Try to get the playbook directly first
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        
        # If we need to filter by company and have organization_id
        if company_name and hasattr(Playbook, 'organization_id') and not playbook:
            # Determine the actual table name for organizations
            inspector = inspect(db.bind)
            table_names = inspector.get_table_names()
            org_table_name = None
            for name in table_names:
                if name.lower() == 'organizations':
                    org_table_name = name
                    break
                    
            if org_table_name:
                # Get the organization ID
                org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
                org_result = db.execute(org_query, {"name": company_name})
                org = org_result.fetchone()
                
                if org:
                    org_id = org[0]
                    # Try to get the playbook with the organization ID
                    playbook = db.query(Playbook).filter(
                        Playbook.id == playbook_id,
                        Playbook.organization_id == org_id
                    ).first()
        
        # If we need to filter by company_name
        elif company_name and hasattr(Playbook, 'company_name') and not playbook:
            playbook = db.query(Playbook).filter(
                Playbook.id == playbook_id,
                Playbook.company_name == company_name
            ).first()
        
        if playbook:
            db.delete(playbook)
            db.commit()
            return True
        return False

def update_playbook(playbook_id: int, update_data: PlaybookBase, company_name: str = None) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        try:
            # First, get the playbook directly without any joins
            playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
            
            if not playbook:
                return None
                
            # If we need to check company name and have organization_id
            if company_name and hasattr(playbook, 'organization_id'):
                # Determine the actual table name for organizations
                inspector = inspect(db.bind)
                table_names = inspector.get_table_names()
                org_table_name = None
                for name in table_names:
                    if name.lower() == 'organizations':
                        org_table_name = name
                        break
                        
                if org_table_name:
                    # Get the organization ID for the company name
                    org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
                    org_result = db.execute(org_query, {"name": company_name})
                    org = org_result.fetchone()
                    
                    if org and str(playbook.organization_id) != str(org[0]):
                        # This playbook doesn't belong to the specified company
                        return None
            
            # If we need to check company_name field
            elif company_name and hasattr(playbook, 'company_name') and playbook.company_name != company_name:
                return None

            # Check if updated name conflicts with existing playbook
            if update_data.name != playbook.name:
                name_query = db.query(Playbook).filter(Playbook.name == update_data.name)
                
                if company_name and hasattr(Playbook, 'organization_id'):
                    # Get the organization ID for the company name
                    inspector = inspect(db.bind)
                    table_names = inspector.get_table_names()
                    org_table_name = None
                    for name in table_names:
                        if name.lower() == 'organizations':
                            org_table_name = name
                            break
                            
                    if org_table_name:
                        # Get the organization ID
                        org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
                        org_result = db.execute(org_query, {"name": company_name})
                        org = org_result.fetchone()
                        
                        if org:
                            org_id = org[0]
                            name_query = name_query.filter(Playbook.organization_id == org_id)
                
                elif company_name and hasattr(Playbook, 'company_name'):
                    name_query = name_query.filter(Playbook.company_name == company_name)
                    
                name_query = name_query.filter(Playbook.id != playbook_id)
                existing = name_query.first()
                if existing:
                    raise HTTPException(status_code=400, detail="Playbook with this name already exists")

            # Update playbook fields - don't touch organization_id
            update_dict = update_data.model_dump()
            for key, value in update_dict.items():
                if key != 'organization_id':  # Skip organization_id to avoid FK issues
                    setattr(playbook, key, value)

            db.commit()
            db.refresh(playbook)
            return PlaybookOut.model_validate(playbook)
        except Exception as e:
            db.rollback()
            print(f"Error updating playbook: {e}")
            raise

def toggle_playbook_status(playbook_id: int, company_name: str = None) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        try:
            # First, get the playbook directly without any joins
            playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
            
            if not playbook:
                return None
                
            # If we need to check company name and have organization_id
            if company_name and hasattr(playbook, 'organization_id'):
                # Determine the actual table name for organizations
                inspector = inspect(db.bind)
                table_names = inspector.get_table_names()
                org_table_name = None
                for name in table_names:
                    if name.lower() == 'organizations':
                        org_table_name = name
                        break
                        
                if org_table_name:
                    # Get the organization ID for the company name
                    org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
                    org_result = db.execute(org_query, {"name": company_name})
                    org = org_result.fetchone()
                    
                    if org and str(playbook.organization_id) != str(org[0]):
                        # This playbook doesn't belong to the specified company
                        return None
            
            # If we need to check company_name field
            elif company_name and hasattr(playbook, 'company_name') and playbook.company_name != company_name:
                return None

            # Toggle the status - this is the only operation we need to perform
            playbook.is_active = not playbook.is_active
            
            db.commit()
            db.refresh(playbook)
            return PlaybookOut.model_validate(playbook)
        except Exception as e:
            db.rollback()
            print(f"Error toggling playbook status: {e}")
            raise

def get_active_playbooks(company_name: str = None) -> List[PlaybookOut]:
    with SessionLocal() as db:
        # Determine the actual table name for organizations
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        org_table_name = None
        for name in table_names:
            if name.lower() == 'organizations':
                org_table_name = name
                break
                
        if company_name and hasattr(Playbook, 'organization_id') and org_table_name:
            # Use raw SQL with explicit type casting to handle UUID vs integer comparison
            query = text(f"""
                SELECT p.* FROM "Playbooks" p
                JOIN "{org_table_name}" o ON p.organization_id::text = o.id::text
                WHERE p.is_active = TRUE AND o.name = :company_name
            """)
            result = db.execute(query, {"company_name": company_name})
            playbooks = []
            for row in result:
                # Convert row to dict and create Playbook object
                playbook_dict = {column: value for column, value in row._mapping.items()}
                playbook = Playbook(**playbook_dict)
                playbooks.append(playbook)
            return [PlaybookOut.model_validate(playbook) for playbook in playbooks]
        else:
            query = db.query(Playbook).filter(Playbook.is_active == True)
            if company_name and hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
                
            playbooks = query.all()
            return [PlaybookOut.model_validate(playbook) for playbook in playbooks]

# Additional functions from master branch, modified to support company filtering

def check_ip_alerts(threshold: int, interval_minutes: int, company_name: str = None):
    with SessionLocal() as db:
        base_query = f"""
        WITH time_windows AS (
            SELECT 
                generate_series(
                    (SELECT MIN(timestamp) FROM SnortAlerts),  
                    (SELECT MAX(timestamp) FROM SnortAlerts),  
                    INTERVAL '1 minute' * {interval_minutes}  
                ) AS window_start
        )
        SELECT 
            s.src_ip,
            t.window_start,
            COUNT(*) AS alert_count
        FROM SnortAlerts s
        JOIN time_windows t
            ON s.timestamp BETWEEN t.window_start AND t.window_start + INTERVAL '{interval_minutes} minutes'
        """
        
        # Add company filter if needed and if the column exists
        if company_name and hasattr(SnortAlerts, 'company_name'):
            base_query += f" WHERE s.company_name = '{company_name}'"
            
        base_query += f"""
        GROUP BY s.src_ip, t.window_start
        HAVING COUNT(*) >= {threshold}
        ORDER BY t.window_start DESC;
        """
        
        result = db.execute(base_query).fetchall()
        return result

def check_and_block_ips(threshold: int, interval_minutes: int, company_name: str = None):
    alerts = check_ip_alerts(threshold, interval_minutes, company_name)
    if alerts:
        for alert in alerts:
            ip = alert[0]
            reason = f"Detected {alert[2]} alerts in {interval_minutes} minutes"
            ip_data = IPAddressSchema(ip=ip, reason=reason)
            # Use the enhanced block_ip function with company name
            block_ip(ip_data, user="system", company_name=company_name)
    return alerts

def check_international_blacklist(company_name: str = None) -> List[str]:
    """
    Checks if the source IP address of any SnortAlert is part of the international blacklist.
    Returns a list of blacklisted IPs found in SnortAlerts.
    """
    with SessionLocal() as db:
        base_query = """
        SELECT DISTINCT s.src_ip
        FROM SnortAlerts s
        JOIN international_blacklist b
        ON s.src_ip = b.ip
        """
        
        # Add company filter if needed and if the column exists
        if company_name and hasattr(SnortAlerts, 'company_name'):
            base_query += f" WHERE s.company_name = '{company_name}'"
            
        result = db.execute(base_query).fetchall()
        return [row[0] for row in result]

def check_international_blacklist_and_block_ips(company_name: str = None):
    ips_to_block = check_international_blacklist(company_name)
    if ips_to_block:
        for ip in ips_to_block:
            ip_data = IPAddressSchema(ip=ip, reason="International blacklist")
            # Use the enhanced block_ip function with company name
            block_ip(ip_data, user="system", company_name=company_name)
    return ips_to_block

def check_exceed_severity_level(severity: str, company_name: str = None) -> List[str]:
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
        raise ValueError("Invalid severity level. Choose from 'low', 'medium', 'high', or 'critical'.")

    min_priority = severity_mapping[severity]

    with SessionLocal() as db:
        base_query = """
        SELECT DISTINCT s.src_ip
        FROM SnortAlerts s
        JOIN priority_classification p
        ON s.classification = p.classification
        WHERE p.priority >= :min_priority
        """
        
        # Add company filter if needed and if the column exists
        if company_name and hasattr(SnortAlerts, 'company_name'):
            base_query += " AND s.company_name = :company_name"
            result = db.execute(base_query, {"min_priority": min_priority, "company_name": company_name}).fetchall()
        else:
            result = db.execute(base_query, {"min_priority": min_priority}).fetchall()
            
        return [row[0] for row in result]

def check_exceed_severity_level_and_block_ip(severity: str, company_name: str = None):
    ips_to_block = check_exceed_severity_level(severity, company_name)
    if ips_to_block:
        for ip in ips_to_block:
            ip_data = IPAddressSchema(ip=ip, reason=f"Exceeded severity level: {severity}")
            # Use the enhanced block_ip function with company name
            block_ip(ip_data, user="system", company_name=company_name)
    return ips_to_block

def check_classtype(classType: str, company_name: str = None) -> List[str]:
    """
    Returns all source IP addresses of threats that match the specified classtype.
    """
    with SessionLocal() as db:
        base_query = """
        SELECT DISTINCT s.src_ip
        FROM SnortAlerts s
        WHERE s.classification = :classtype
        """
        
        # Add company filter if needed and if the column exists
        if company_name and hasattr(SnortAlerts, 'company_name'):
            base_query += " AND s.company_name = :company_name"
            result = db.execute(base_query, {"classtype": classType, "company_name": company_name}).fetchall()
        else:
            result = db.execute(base_query, {"classtype": classType}).fetchall()
            
        return [row[0] for row in result]

def check_classtype_and_block_ip(classType: str, company_name: str = None):
    ips_to_block = check_classtype(classType, company_name)
    if ips_to_block:
        for ip in ips_to_block:
            ip_data = IPAddressSchema(ip=ip, reason=f"Matched classtype: {classType}")
            # Use the enhanced block_ip function with company name
            block_ip(ip_data, user="system", company_name=company_name)
    return ips_to_block

def execute_playbook_rules(company_name: str = None):
    """
    Iterates over all active playbooks and evaluates their conditions.
    If all conditions in a playbook are met, the specified actions are executed.
    Modified to support company-specific filtering.
    """
    try:
        with SessionLocal() as db:
            # Get active playbooks using ORM when possible
            active_playbooks = []
            
            # Basic query for active playbooks
            base_query = db.query(Playbook).filter(Playbook.is_active == True)
            
            # If filtering by company name with company_name field
            if company_name and hasattr(Playbook, 'company_name'):
                filtered_playbooks = base_query.filter(Playbook.company_name == company_name).all()
                active_playbooks.extend(filtered_playbooks)
            
            # If filtering by company name with organization_id field
            elif company_name and hasattr(Playbook, 'organization_id'):
                # Determine the actual table name for organizations
                inspector = inspect(db.bind)
                table_names = inspector.get_table_names()
                org_table_name = None
                for name in table_names:
                    if name.lower() == 'organizations':
                        org_table_name = name
                        break
                        
                if org_table_name:
                    # Get the organization ID
                    org_query = text(f'SELECT id FROM "{org_table_name}" WHERE name = :name')
                    org_result = db.execute(org_query, {"name": company_name})
                    org = org_result.fetchone()
                    
                    if org:
                        org_id = org[0]
                        # Get playbooks with this organization ID
                        filtered_playbooks = base_query.filter(Playbook.organization_id == org_id).all()
                        active_playbooks.extend(filtered_playbooks)
                    
                    # If we couldn't find the organization or filter by ID, use raw SQL as fallback
                    if not active_playbooks and org_table_name:
                        query = text(f"""
                            SELECT p.* FROM "Playbooks" p
                            JOIN "{org_table_name}" o ON p.organization_id::text = o.id::text
                            WHERE p.is_active = TRUE AND o.name = :company_name
                        """)
                        result = db.execute(query, {"company_name": company_name})
                        for row in result:
                            # Convert row to dict and create Playbook object
                            playbook_dict = {column: value for column, value in row._mapping.items()}
                            playbook = Playbook(**playbook_dict)
                            # Merge with session to make it persistent
                            playbook = db.merge(playbook)
                            active_playbooks.append(playbook)
            else:
                # No company filtering, get all active playbooks
                active_playbooks = base_query.all()

            for playbook in active_playbooks:
                conditions = playbook.conditions
                actions = playbook.actions
                
                # Get the playbook's company name for filtering alerts
                playbook_company = None
                if hasattr(playbook, 'company_name'):
                    playbook_company = playbook.company_name
                elif hasattr(playbook, 'organization_id') and playbook.organization_id:
                    # Determine the actual table name for organizations
                    inspector = inspect(db.bind)
                    table_names = inspector.get_table_names()
                    org_table_name = None
                    for name in table_names:
                        if name.lower() == 'organizations':
                            org_table_name = name
                            break
                            
                    if org_table_name:
                        # Get company name from organization_id using raw SQL
                        org_query = text(f'SELECT name FROM "{org_table_name}" WHERE id::text = :org_id::text')
                        org_result = db.execute(org_query, {"org_id": str(playbook.organization_id)})
                        org = org_result.fetchone()
                        if org:
                            playbook_company = org[0]

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
                        alerts = check_ip_alerts(threshold, interval_minutes, playbook_company)
                        ips_to_block.update(alert[0] for alert in alerts)

                    elif condition_type == "severity" and field == "severity":
                        severity = value
                        ips = check_exceed_severity_level(severity, playbook_company)
                        ips_to_block.update(ips)

                    elif condition_type == "class_type" and field == "class_type":
                        class_type = value
                        ips = check_classtype(class_type, playbook_company)
                        ips_to_block.update(ips)

                    elif condition_type == "ip_reputation" and field == "source_ip" and operator == "exists":
                        ips = check_international_blacklist(playbook_company)
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
                            alerts = check_ip_alerts(threshold, interval_minutes, playbook_company)
                            condition_ips = set(alert[0] for alert in alerts)

                        elif condition_type == "severity" and field == "severity":
                            severity = value
                            condition_ips = set(check_exceed_severity_level(severity, playbook_company))

                        elif condition_type == "class_type" and field == "class_type":
                            class_type = value
                            condition_ips = set(check_classtype(class_type, playbook_company))

                        elif condition_type == "ip_reputation" and field == "source_ip" and operator == "exists":
                            condition_ips = set(check_international_blacklist(playbook_company))

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
                        ip_data = IPAddressSchema(ip=ip, reason=f"Blocked by playbook: {playbook.name}")
                        # Use the enhanced block_ip function with company name
                        block_ip(ip_data, user="system", company_name=playbook_company)
        return True
    except Exception as e:
        # Log the exception if needed
        print(f"Error executing playbook rules: {e}")
        return False