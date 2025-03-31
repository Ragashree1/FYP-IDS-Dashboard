import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

print(os.getenv("DATABASE_URL"))

DATABASE_URL = os.getenv("DATABASE_URL")



#error code if Database_URL is empty
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set!")

#creates database engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

<<<<<<< Updated upstream
import models.models #attempt to fix a circular import error

Base.metadata.create_all(engine)
=======
# Add the get_db dependency function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Remove this line as it creates circular import
# Base.metadata.create_all(engine)
>>>>>>> Stashed changes
