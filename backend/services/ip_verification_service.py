from sqlalchemy.orm import Session
from models.models import VerifiedIP, LogEntry, Client
from fastapi import Request

def verify_and_store_ip(client_id: int, submitted_ip: str, request_ip: str, db: Session):
    # Check if client exists
    client_exists = db.query(Client).filter(Client.id == client_id).first()
    if not client_exists:
        return {"status": "error", "message": "Client ID does not exist."}

    # Ensure submitted IP matches detected IP
    if submitted_ip != request_ip:
        return {"status": "error", "message": "IP verification failed. Your request IP does not match the submitted IP."}

    # Check if IP is already verified
    existing_ip = db.query(VerifiedIP).filter(
        VerifiedIP.client_id == client_id, VerifiedIP.ip == submitted_ip
    ).first()

    if existing_ip:
        return {"status": "error", "message": "This IP is already verified."}

    # Store the verified IP
    new_verified_ip = VerifiedIP(client_id=client_id, ip=submitted_ip, is_verified=True)
    db.add(new_verified_ip)
    db.commit()
    db.refresh(new_verified_ip)

    return {"status": "success", "message": "IP verified successfully!", "verified_ip": submitted_ip}

def store_log(client_id: int, request_ip: str, log_data: str, db: Session):
    # Check if the IP is verified for the client
    is_verified = db.query(VerifiedIP).filter(
        VerifiedIP.ip == request_ip,
        VerifiedIP.client_id == client_id,
        VerifiedIP.is_verified == True
    ).first()

    if not is_verified:
        return {"status": "error", "message": "Unauthorized IP. You cannot forward logs."}

    # Store the log entry
    new_log = LogEntry(client_id=client_id, ip=request_ip, log_data=log_data)
    db.add(new_log)
    db.commit()

    return {"status": "success", "message": "Log stored successfully."}
