import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# Ensure DATABASE_URL is set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file! Please check.")

# Print loaded database URL (for debugging)
#print(f"DATABASE_URL from .env: {DATABASE_URL}")

# IMPROVED: Add connection pooling settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,      # Increase default pool size (default is 5)
    max_overflow=20,   # Allow 20 additional connections
    pool_timeout=30,   # Wait 30 seconds before failing a connection
    pool_recycle=1800, # Reuse connections after 30 minutes
    echo=False         # Disabled echo for better performance
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Ensure DB connections are properly closed
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
