from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models
from dotenv import load_dotenv
load_dotenv()

from .routes import customers, complaints, contracts

app = FastAPI(title="Hackatoon Backend", version="1.0")

# setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# register routes
app.include_router(customers.router)
app.include_router(complaints.router)
app.include_router(contracts.router)


@app.get("/")
def root():
    return {"status": "Backend running, database connected"}
