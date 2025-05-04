import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, TIMESTAMP, JSON, DateTime, func, Boolean, Table, UniqueConstraint, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import validates, relationship
from database import Base
from datetime import datetime
import json

class MeetingMinutes(Base):
    __tablename__= 'Meeting'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    startTime = Column(String)
    endTime = Column(String)
    pplpresent = Column(ARRAY(String))
    agenda = Column(String)
    discussion = Column(String)
    actions = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Journal(Base):
    __tablename__= 'Journal'
    id = Column(Integer, primary_key=True, index=True)
    jName = Column(String, index=True)
    jDescription = Column(String)
    jWeek = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    logs = relationship("LogEntry", back_populates="organization")

class BlockedIP(Base):
    __tablename__ = "blocked_ips"
    __table_args__ = (
        UniqueConstraint('ip', 'organization_id', name='unique_ip_per_org'),
    )

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, nullable=False)  
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization")

class SnortAlerts(Base):
    __tablename__ = 'SnortAlerts'
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    priority = Column(Integer)
    protocol = Column(String)
    raw = Column(String)
    length = Column(Integer)
    direction = Column(String)
    src_ip = Column(String)
    src_port = Column(Integer)
    dest_ip = Column(String)
    dest_port = Column(Integer)
    classification = Column(String)
    action = Column(String)
    message = Column(String)
    signature_id = Column(String)
    host = Column(String)
    alert_source = Column(String, default="snort")
    organization_id = Column(Integer)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

# New SuricataAlerts model
class SuricataAlerts(Base):
    __tablename__ = 'SuricataAlerts'
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    priority = Column(Integer)
    protocol = Column(String)
    raw = Column(String)
    length = Column(Integer)
    direction = Column(String)
    src_ip = Column(String)
    src_port = Column(Integer)
    dest_ip = Column(String)
    dest_port = Column(Integer)
    classification = Column(String)
    action = Column(String)
    message = Column(String)
    signature_id = Column(String)
    host = Column(String)
    alert_source = Column(String, default="suricata") 
    organization_id = Column(Integer)

    class Config:
        from_attributes = True  # Updated from orm_mode = True
		
class ZeekAlerts(Base):
    __tablename__ = 'ZeekAlerts'
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    priority = Column(Integer)
    priority_name = Column(String)  # Add this line
    protocol = Column(String)
    raw = Column(String)
    length = Column(Integer, default=0)
    direction = Column(String, default="->")
    src_ip = Column(String)
    src_port = Column(Integer)
    dest_ip = Column(String)
    dest_port = Column(Integer)
    classification = Column(String)
    action = Column(String, default="ALERT")
    message = Column(String)
    signature_id = Column(String, default="0")
    host = Column(String)
    alert_source = Column(String, default="zeek")
    organization_id = Column(Integer)
    conn_id = Column(String, nullable=True)
    event_type = Column(String, nullable=True)
    uid = Column(String, nullable=True)
    service = Column(String, nullable=True)

    class Config:
        from_attributes = True

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    organization = relationship("Organization")
    
    # Removed name and email since they're no longer needed
    # name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

class VerifiedIP(Base):
    __tablename__ = "verified_ips"
    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, nullable=False)  # Remove unique=True constraint
    is_verified = Column(Boolean, default=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)  # Make this non-nullable
    organization = relationship("Organization")
    
    # Add a unique constraint for ip + organization_id combination
    __table_args__ = (
        UniqueConstraint('ip', 'organization_id', name='unique_ip_per_org'),
    )

class LogEntry(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    ip = Column(String, nullable=False)
    log_data = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="logs")

class Account(Base):
    __tablename__= 'Account'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    userFirstName = Column(String)
    userLastName = Column(String)
    passwd = Column(String)
    userComName = Column(String)
    userEmail = Column(String)
    userPhoneNum = Column(String)
    userRole = Column(Integer, ForeignKey("role.id"))
    userSuspend = Column(Boolean)
    userRejected = Column(Boolean, default=False)  # Added userRejected field
    fromOrgRequestsPage = Column(Boolean, default=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))  
    organization = relationship("Organization")  
   
    role = relationship("Role", back_populates="accounts")
    
    __table_args__ = (
        UniqueConstraint('username', 'userComName', name='unique_username_company'),
    )
    
    class Config:
        from_attributes = True  # Updated from orm_mode = True

class CreditCard(Base):
    __tablename__= 'creditcard'
    id = Column(Integer,primary_key=True, index=True)
    creditFirstName = Column(String) #Maybe later make it so that it retreives the userFirstName
    creditLastName = Column(String) #Maybe later make it so that it retreives the userLastName
    creditNum = Column(String)
    creditDate= Column(String)
    creditCVV = Column(Integer)
    subscription = Column(String)
    total = Column(String)
    userid = Column(Integer, ForeignKey('Account.id')) #Encountered error while trying to import username as a foreign key, remember to come back when free and try solve this issue


    class Config:
        from_attributes = True  # Updated from orm_mode = True

role_permission_association = Table(
    'role_permission_association', Base.metadata,
    Column('role_id', Integer, ForeignKey('role.id')),
    Column('permission_id', Integer, ForeignKey('permission.id'))
)


class Role(Base):
    __tablename__ = 'role'
    id = Column(Integer, primary_key=True, index=True)
    roleName = Column(String)

    # Back reference to Account
    accounts = relationship("Account", back_populates="role")

    # Many-to-many relationship
    permissions = relationship('Permission', secondary=role_permission_association, back_populates='roles')

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Permission(Base):
    __tablename__ = 'permission'
    id = Column(Integer, primary_key=True, index=True)
    permissionName = Column(String)

    # Many-to-many relationship
    roles = relationship('Role', secondary=role_permission_association, back_populates='permissions')

    class Config:
        from_attributes = True  # Updated from orm_mode = True


class Report(Base):
    __tablename__= 'report'
    id = Column(Integer,primary_key=True, index=True)
    reportName = Column(String)
    reportFormat = Column(String)
    reportType = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class InternationalBlacklist(Base):
    __tablename__ = "international_blacklist"
    ip = Column(String, primary_key=True, nullable=False)

class TokenTable(Base):
    __tablename__ = "token"
    id = Column(Integer,primary_key=True, index=True)
    access_token = Column(String)
    refresh_token = Column(String,nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.now)

class PriorityClassification(Base):
    __tablename__ = "priority_classification"
    id = Column(Integer, primary_key=True, index=True)
    priority = Column(Integer, nullable=False)
    classification = Column(String, nullable=False)

class Logs(Base):
    __tablename__ = "Logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)  
    log_type = Column(String, index=True)
    source_ip = Column(String)
    host = Column(String)
    message = Column(String)
    event_data = Column(JSON)
    http_method = Column(String, nullable=True)
    http_status = Column(Integer, nullable=True)
    url = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    log_path = Column(String, nullable=True)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Playbook(Base):
    __tablename__ = "Playbooks"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)  # Foreign key to an Organization table
    name = Column(String, unique=True, nullable=False)  # Name of the playbook
    description = Column(String, nullable=True)  # Optional description of what the playbook does
    conditions = Column(JSON, nullable=False)  # JSON structure to define rules (e.g., {"log_type": "alert", "priority": ">3"})
    actions = Column(JSON, nullable=False)  # JSON array to store multiple actions (e.g., ["block_ip", "alert"])
    is_active = Column(Boolean, default=True)  
    created_at = Column(TIMESTAMP, server_default=func.now())  
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())  # Timestamp of last update

    class Config:
        from_attributes = True  # Updated from orm_mode = True

    def evaluate_conditions(self, logs, blocked_ips):
        """
        Evaluate playbook conditions against logs and return IPs to block.
        """
        ips_to_block = set()

        for condition in self.conditions:
            condition_type = condition.get("condition_type")
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            window_period = int(condition.get("window_period", 0))  # in minutes

            if condition_type == "threshold":
                ips_to_block.update(self._check_threshold(logs, field, operator, value, window_period))
            elif condition_type == "ip_reputation":
                ips_to_block.update(self._check_ip_reputation(logs, value))
            elif condition_type == "geo_location":
                ips_to_block.update(self._check_geo_location(logs, value))
            # Add more condition types as needed...

        # Exclude already blocked IPs
        return ips_to_block - set(blocked_ips)

    def _check_threshold(self, logs, field, operator, value, window_period):
        """
        Check if logs exceed the threshold for a specific field within the window period.
        """
        from datetime import datetime, timedelta

        now = datetime.utcnow()
        threshold_time = now - timedelta(minutes=window_period)
        filtered_logs = [log for log in logs if datetime.strptime(log.timestamp, "%Y-%m-%d %H:%M:%S") >= threshold_time]

        ip_counts = {}
        for log in filtered_logs:
            ip = getattr(log, "src_ip", None)
            if ip and getattr(log, field, None):
                ip_counts[ip] = ip_counts.get(ip, 0) + 1

        ips_to_block = set()
        for ip, count in ip_counts.items():
            if operator == "greater than or equal" and count >= int(value):
                ips_to_block.add(ip)

        return ips_to_block

    def _check_ip_reputation(self, logs, value):
        """
        Check if IPs are part of an international blocklist or threat feed.
        """
        # Simulate checking against an external blocklist (e.g., threat intel feed)
        threat_feed = {"192.168.1.1", "203.0.113.5"}  # Example blocklist
        return {log.src_ip for log in logs if log.src_ip in threat_feed}

    def _check_geo_location(self, logs, value):
        """
        Check if IPs belong to a specific geolocation.
        """
        # Simulate geolocation check (e.g., using a geolocation API)
        restricted_countries = {"North Korea", "Iran"}  # Example restricted countries
        geo_ip_map = {"192.168.1.1": "North Korea", "203.0.113.5": "USA"}  # Example IP-to-country mapping

        return {log.src_ip for log in logs if geo_ip_map.get(log.src_ip) in restricted_countries}

# New ActivityLog model for tracking user management activities
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    user = Column(String, nullable=False)  # Username of the user who performed the action
    targetUser = Column(String, nullable=False)  # Username of the user who was affected
    action = Column(String, nullable=False)  # Type of action (user_created, user_updated, etc.)
    description = Column(String, nullable=False)  # Description of the action
    ipAddress = Column(String)  # IP address of the user who performed the action
    userComName = Column(String, nullable=False)  # Company name for filtering logs by company
    
    class Config:
        from_attributes = True

# New SystemLog model for tracking system activities (playbooks, etc.)
class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    user = Column(String, nullable=False)  # Username of the user who performed the action
    component = Column(String, nullable=False)  # System component affected (e.g., "Playbook", "Firewall", etc.)
    action = Column(String, nullable=False)  # Type of action (playbook_created, rule_added, etc.)
    description = Column(String, nullable=False)  # Description of the action
    ipAddress = Column(String)  # IP address of the user who performed the action
    resourceId = Column(String, nullable=True)  # ID of the affected resource (e.g., playbook ID)
    resourceName = Column(String, nullable=True)  # Name of the affected resource (e.g., playbook name)
    userComName = Column(String, nullable=True)
	
    class Config:
        from_attributes = True

# New Review model for storing customer reviews
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    class Config:
        from_attributes = True