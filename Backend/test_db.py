from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DATABASE_URL")
print("DATABASE_URL =", url)

engine = create_engine(url)

with engine.connect() as conn:
    print("CONNECTED SUCCESSFULLY 🎉")
