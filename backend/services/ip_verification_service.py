from sqlalchemy.orm import Session
from models.models import VerifiedIP, LogEntry, Client, Organization
from fastapi import Request, HTTPException
import ipaddress
import logging
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

def normalize_ip(ip_str: str) -> str:
    try:
        return str(ipaddress.ip_address(ip_str.strip()))
    except ValueError:
        return ip_str.strip().lower()

def verify_and_store_ip(organization_id: int, submitted_ip: str, request_ip: str, db: Session):
    organization_exists = db.query(Organization).filter(Organization.id == organization_id).first()
    if not organization_exists:
        return {"status": "error", "message": "Organization ID does not exist."}

    normalized_submitted_ip = normalize_ip(submitted_ip)
    normalized_request_ip = normalize_ip(request_ip)

    if normalized_submitted_ip != normalized_request_ip:
        return {"status": "error", "message": "IP verification failed. Your request IP does not match the submitted IP."}

    existing_ip = db.query(VerifiedIP).filter(
        VerifiedIP.organization_id == organization_id, 
        VerifiedIP.ip == normalized_submitted_ip
    ).first()

    if existing_ip:
        return {"status": "error", "message": "This IP is already verified for the organization."}

    new_verified_ip = VerifiedIP(organization_id=organization_id, ip=normalized_submitted_ip, is_verified=True)
    db.add(new_verified_ip)
    db.commit()
    db.refresh(new_verified_ip)

    return {"status": "success", "message": "IP verified successfully!", "verified_ip": normalized_submitted_ip}

def store_log(organization_id: int, request_ip: str, log_data: str, db: Session):
    try:
        is_verified = db.query(VerifiedIP).filter(
            VerifiedIP.ip == request_ip,
            VerifiedIP.organization_id == organization_id,
            VerifiedIP.is_verified == True
        ).first()

        if not is_verified:
            return {"status": "error", "message": "Unauthorized IP. You cannot forward logs."}

        new_log = LogEntry(organization_id=organization_id, ip=request_ip, log_data=log_data)
        db.add(new_log)
        db.commit()

        timestamp = datetime.now().isoformat()
        es_log = {
            "@timestamp": timestamp,
            "organization_id": organization_id,
            "source": {"address": request_ip},
            "message": log_data,
            "fields": {"log_type": "client_forwarded"},
            "host": {"ip": [request_ip]},
            "event": {"original": f"Log forwarded by client at {timestamp}"},
            "http": {"request": {"method": "POST"}, "response": {"status_code": 200}},
            "url": {"original": "/ip-verification/forward-log"},
            "user_agent": {"original": "Client Application"}
        }

        es_url = "http://localhost:9200/client-logs/_doc"
        headers = {"Content-Type": "application/json"}
        requests.post(es_url, json=es_log, headers=headers)

        return {"status": "success", "message": "Log stored successfully."}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Failed to store log: {str(e)}"}

def get_logs_for_organization(organization_id: int, db: Session, include_snort_logs=True):
    verified_ips = db.query(VerifiedIP.ip).filter(
        VerifiedIP.organization_id == organization_id,
        VerifiedIP.is_verified == True
    ).all()
    ip_list = [ip[0] for ip in verified_ips]

    if not ip_list:
        return []

    db_logs = db.query(LogEntry).filter(
        LogEntry.organization_id == organization_id,
        LogEntry.ip.in_(ip_list)
    ).order_by(LogEntry.timestamp.desc()).all()

    result_logs = [{
        "source": log.ip,
        "timestamp": log.timestamp.isoformat(),
        "message": log.log_data,
        "type": "client_forwarded"
    } for log in db_logs]

    if include_snort_logs:
        es_logs = fetch_snort_logs_for_ips(ip_list)
        result_logs.extend(es_logs)
        result_logs.sort(key=lambda x: x["timestamp"], reverse=True)

    return result_logs

def delete_verified_ip(ip_id: int, db: Session):
    try:
        ip_entry = db.query(VerifiedIP).filter(VerifiedIP.id == ip_id).first()
        if not ip_entry:
            raise HTTPException(status_code=404, detail="Verified IP not found")

        db.delete(ip_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting verified IP with id={ip_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete verified IP: {str(e)}")

def delete_logs_for_organization(organization_id: int, db: Session):
    try:
        logs = db.query(LogEntry).filter(LogEntry.organization_id == organization_id).all()
        for log in logs:
            db.delete(log)
        db.commit()
        return {"status": "success", "message": f"Logs deleted for organization {organization_id}"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting logs for organization_id={organization_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete logs: {str(e)}")

def fetch_snort_logs_for_ips(ip_list):
    try:
        ip_conditions = [{"term": {"source.address": ip}} for ip in ip_list]

        es_url = "http://localhost:9200/apache-*/_search"
        query = {
            "size": 100,
            "query": {"bool": {"should": ip_conditions, "minimum_should_match": 1}},
            "sort": [{"@timestamp": "desc"}]
        }

        headers = {"Content-Type": "application/json"}
        response = requests.get(es_url, json=query, headers=headers)
        
        if response.status_code >= 400:
            logger.error(f"Elasticsearch query failed: {response.text}")
            return []

        hits = response.json().get('hits', {}).get('hits', [])
        logs = []

        for hit in hits:
            source = hit.get("_source", {})
            logs.append({
                "source": source.get("source", {}).get("address", ""),
                "timestamp": source.get("@timestamp", ""),
                "message": source.get("message", ""),
                "type": "snort_detected",
                "additional_data": {
                    "log_type": source.get("fields", {}).get("log_type", ""),
                    "http_method": source.get("http", {}).get("request", {}).get("method", ""),
                    "http_status": source.get("http", {}).get("response", {}).get("status_code", ""),
                    "url": source.get("url", {}).get("original", ""),
                    "host": source.get("host", {}).get("ip", [""])[0]
                }
            })
        return logs
    except Exception as e:
        logger.error(f"Failed to fetch Elasticsearch logs: {str(e)}")
        return []
