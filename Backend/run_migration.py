import os
import sys
from sqlalchemy import text
from app.database import engine

def migrate():
    print("Running migration to add enterprise fields to customers table...")
    
    commands = [
        "ALTER TABLE customers ADD COLUMN company_name VARCHAR(255)",
        "ALTER TABLE customers ADD COLUMN legal_form VARCHAR(50)",
        "ALTER TABLE customers ADD COLUMN trade_register VARCHAR(100)",
        "ALTER TABLE customers ADD COLUMN ice_number VARCHAR(100)",
        "ALTER TABLE customers ADD COLUMN legal_representative_name VARCHAR(150)",
        "ALTER TABLE customers ADD COLUMN legal_representative_cin VARCHAR(50)",
    ]
    
    with engine.connect() as conn:
        for cmd in commands:
            try:
                conn.execute(text(cmd))
                print(f"Executed: {cmd}")
            except Exception as e:
                # Column might already exist
                print(f"Skipped (or error): {cmd} -> {e}")
        conn.commit()
    
    print("Migration completed.")

if __name__ == "__main__":
    # Ensure app directory is in path
    sys.path.append(os.path.join(os.path.dirname(__file__)))
    migrate()
