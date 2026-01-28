from fastapi import FastAPI
from .database import engine, Base
from . import models
from dotenv import load_dotenv
load_dotenv()

from .routes import customers, complaints, contracts

app = FastAPI(title="Hackatoon Backend", version="1.0")

# AUTO CREATE / UPDATE TABLES
Base.metadata.create_all(bind=engine)

# REGISTER ROUTERS
app.include_router(customers.router)
app.include_router(complaints.router)
app.include_router(contracts.router)


@app.get("/")
def root():
    return {"status": "Backend running, database connected"}
