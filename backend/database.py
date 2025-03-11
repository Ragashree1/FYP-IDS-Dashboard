import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

print(os.getenv('DATABASE_URL'))

DATABASE_URL = os.getenv('DATABASE_URL')

#creates database engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Create all tables in the database
Base.metadata.create_all(bind=engine)
