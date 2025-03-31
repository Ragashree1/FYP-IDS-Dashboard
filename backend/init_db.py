from database import SessionLocal, engine
from models.models import Base, Role, Permission

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

if __name__ == "__main__":
    init_database()
