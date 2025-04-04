from database import SessionLocal, engine
from models.models import Base, Role, Permission, InternationalBlacklist
import requests
import json
from dotenv import load_dotenv
import os



def init_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if roles already exist
        existing_roles = db.query(Role).all()
        if not existing_roles:
            # Create default roles
            roles = [
                Role(id=1, roleName="organisation-admin"),
                Role(id=2, roleName="network-admin"),
            ]
            db.bulk_save_objects(roles)
            db.commit()
            print("Default roles created successfully")
        else:
            print("Roles already exist")

        # Check if the international blacklist table is already filled
        existing_blacklist = db.query(InternationalBlacklist).first()
        if not existing_blacklist:
            load_dotenv()
            API_KEY = os.getenv("API_KEY")

            url = 'https://api.abuseipdb.com/api/v2/blacklist'
            querystring = { 'confidenceMinimum': '90' }
            headers = {
                'Accept': 'application/json',
                'Key': API_KEY
            }

            response = requests.get(url, headers=headers, params=querystring)

            if response.status_code == 200:
                decoded_response = response.json()
                blacklist_data = decoded_response.get("data", [])

                blacklist_entries = [
                    InternationalBlacklist(ip=entry["ipAddress"])
                    for entry in blacklist_data
                ]
                db.bulk_save_objects(blacklist_entries)
                db.commit()
                print("International blacklist table populated successfully")
            else:
                print(f"Failed to fetch blacklist data: {response.status_code}")
        else:
            print("International blacklist table already populated")

    finally:
        db.close()


if __name__ == "__main__":
    init_database()
