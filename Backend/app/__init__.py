# Backend Application Initialization
# This ensures all tables are created in Aiven MySQL on first run

from .database import Base, engine
from . import models

def init_db():
    # create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

if __name__ == "__main__":
    init_db()
