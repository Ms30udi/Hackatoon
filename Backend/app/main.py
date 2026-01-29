
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models
from dotenv import load_dotenv
load_dotenv()

from .routes import customers, complaints, contracts

app = FastAPI(title="Hackatoon Backend", version="1.0")

# CORS middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For prod, set to ["http://localhost:8080"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AUTO CREATE / UPDATE TABLES
Base.metadata.create_all(bind=engine)

# REGISTER ROUTERS
app.include_router(customers.router)
app.include_router(complaints.router)
app.include_router(contracts.router)


@app.get("/")
def root():
    return {"status": "Backend running, database connected"}
