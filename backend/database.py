import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Ensure DATABASE_URL is set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file! Please check.")

# Print loaded database URL (for debugging)
#print(f"DATABASE_URL from .env: {DATABASE_URL}")

#  Add connection pooling settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,     
    max_overflow=20,   
    pool_timeout=30,   
    pool_recycle=1800, 
    echo=False         
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Remove this line as it creates circular import
# Base.metadata.create_all(engine)