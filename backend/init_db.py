from database import SessionLocal, engine
from models.models import Base, Role, Permission, InternationalBlacklist, PriorityClassification
import requests
import json
from dotenv import load_dotenv
import os



def init_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize roles
    with SessionLocal() as db:
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

            querystring = {
                'confidenceMinimum': '90'
            }

            headers = {
                'Accept': 'application/json',
                'Key': API_KEY
            }

            response = requests.request(method='GET', url=url, headers=headers, params=querystring)

            if response.status_code == 200:
                decoded_response = json.loads(response.text)
                blacklist_data = decoded_response.get("data", [])

                # Insert IPs into the international_blacklist table
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

        defaultClassifications = [
            { "name": "not-suspicious",  "priority": 3,  "text": "Not Suspicious Traffic" },
            { "name": "unknown",  "priority": 3,  "text": "Unknown Traffic" },
            { "name": "bad-unknown",  "priority": 2,  "text": "Potentially Bad Traffic" },
            { "name": "attempted-recon",  "priority": 2,  "text": "Attempted Information Leak" },
            { "name": "successful-recon-limited",  "priority": 2,  "text": "Information Leak" },
            { "name": "successful-recon-largescale",  "priority": 2,  "text": "Large Scale Information Leak" },
            { "name": "attempted-dos",  "priority": 2,  "text": "Attempted Denial of Service" },
            { "name": "successful-dos",  "priority": 2,  "text": "Denial of Service" },
            { "name": "attempted-user",  "priority": 1,  "text": "Attempted User Privilege Gain" },
            { "name": "unsuccessful-user",  "priority": 1,  "text": "Unsuccessful User Privilege Gain" },
            { "name": "successful-user",  "priority": 1,  "text": "Successful User Privilege Gain" },
            { "name": "attempted-admin",  "priority": 1,  "text": "Attempted Administrator Privilege Gain" },
            { "name": "successful-admin",  "priority": 1,  "text": "Successful Administrator Privilege Gain" },
            { "name": "rpc-portmap-decode",  "priority": 2,  "text": "Decode of an RPC Query" },
            { "name": "shellcode-detect",  "priority": 1,  "text": "Executable code was detected" },
            { "name": "string-detect",  "priority": 3,  "text": "A suspicious string was detected" },
            { "name": "suspicious-filename-detect",  "priority": 2,  "text": "A suspicious filename was detected" },
            { "name": "suspicious-login",  "priority": 2,  "text": "An attempted login using a suspicious username was detected" },
            { "name": "system-call-detect",  "priority": 2,  "text": "A system call was detected" },
            { "name": "tcp-connection",  "priority": 4,  "text": "A TCP connection was detected" },
            { "name": "trojan-activity",  "priority": 1,  "text": "A Network Trojan was detected" },
            { "name": "unusual-client-port-connection",  "priority": 2,  "text": "A client was using an unusual port" },
            { "name": "network-scan",  "priority": 3,  "text": "Detection of a Network Scan" },
            { "name": "denial-of-service",  "priority": 2,  "text": "Detection of a Denial of Service Attack" },
            { "name": "non-standard-protocol",  "priority": 2,  "text": "Detection of a non-standard protocol or event" },
            { "name": "protocol-command-decode",  "priority": 3,  "text": "Generic Protocol Command Decode" },
            { "name": "web-application-activity",  "priority": 2,  "text": "Access to a potentially vulnerable web application" },
            { "name": "web-application-attack",  "priority": 1,  "text": "Web Application Attack" },
            { "name": "misc-activity",  "priority": 3,  "text": "Misc activity" },
            { "name": "misc-attack",  "priority": 2,  "text": "Misc Attack" },
            { "name": "icmp-event",  "priority": 3,  "text": "Generic ICMP event" },
            { "name": "inappropriate-content",  "priority": 1,  "text": "Inappropriate Content was Detected" },
            { "name": "policy-violation",  "priority": 1,  "text": "Potential Corporate Privacy Violation" },
            { "name": "default-login-attempt",  "priority": 2,  "text": "Attempt to login by a default username and password" },
            { "name": "sdf",  "priority": 2,  "text": "Sensitive Data" },
            { "name": "file-format",  "priority": 1,  "text": "Known malicious file or file based exploit" },
            { "name": "malware-cnc",  "priority": 1,  "text": "Known malware command and control traffic" },
            { "name": "client-side-exploit",  "priority": 1,  "text": "Known client side exploit attempt" }
        ];

        # Populate priority_classification table
        existing_priority_classifications = db.query(PriorityClassification).first()
        if not existing_priority_classifications:
            priority_classifications = [
                PriorityClassification(priority=item["priority"], classification=item["text"])
                for item in defaultClassifications
            ]
            db.bulk_save_objects(priority_classifications)
            db.commit()
            print("Priority classification table populated successfully")
        else:
            print("Priority classification table already populated")

if __name__ == "__main__":
    init_database()
