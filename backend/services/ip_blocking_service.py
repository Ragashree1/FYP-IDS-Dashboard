from sqlalchemy.orm import Session
from models.models import BlockedIP
from models.schemas import IPAddressSchema

def block_ip(db: Session, ip_data: IPAddressSchema):
    ip_str = str(ip_data.ip)
    existing_ip = db.query(BlockedIP).filter_by(ip=ip_str).first()
    if existing_ip:
        return {"error": "IP already blocked"}
    
    new_ip = BlockedIP(ip=ip_str)
    db.add(new_ip)
    db.commit()
    return {"message": f"Blocked {ip_str}"}

def get_blocked_ips(db: Session):
    return [ip.ip for ip in db.query(BlockedIP).all()]
