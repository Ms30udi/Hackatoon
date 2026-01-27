"""
Main Entry Point - Service Intelligence API

This module initializes the FastAPI application and defines the core RESTful 
endpoints for contract management, connection requests, and customer complaints.
It integrates SQLAlchemy for persistence and implements CORS for frontend communication.

@author: Engineering Team
@version: 1.0.0
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, get_db
from . import models, schemas
import uuid
from datetime import datetime

# Initialize FastAPI application with descriptive metadata
app = FastAPI(
    title="Service Intelligence Portal API",
    description="Backend services for energy contract lifecycle and complaint management.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration (allow frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables automatically on startup (if they don't exist)
@app.on_event("startup")
def startup_event():
    """Create all tables on app startup"""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # Tables might already exist, which is fine
        print(f"Note: Tables already exist or skipping: {e}")

# Helper functions
def get_or_create_customer(db: Session, national_id: str, full_name: str, email: str, phone: str, address: str = ""):
    """
    Retrieves an existing customer by national ID or creates a new record.
    
    Args:
        db (Session): Database session
        national_id (str): Customer's National ID (CIN)
        full_name (str): Full name of the customer
        email (str): Customer email address
        phone (str): Customer phone number
        address (str, optional): Physical address. Defaults to "".
        
    Returns:
        models.Customer: The retrieved or newly created customer object
    """
    customer = db.query(models.Customer).filter(models.Customer.national_id == national_id).first()
    if not customer:
        customer = models.Customer(
            full_name=full_name,
            national_id=national_id,
            email=email,
            phone=phone,
            address=address
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    return customer

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "Backend running", "version": "1.0.0"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check - verifies DB connection"""
    try:
        # Simple query to test DB connection
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Aiven MySQL connection successful"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# ============================================================================
# FORM SUBMISSION ENDPOINTS
# ============================================================================

@app.post("/api/contracts/new", status_code=201)
def create_new_contract(payload: schemas.NewContractRequest, db: Session = Depends(get_db)):
    """
    Processes a submission for a new electricity contract.
    Creates customer, meter, and contract records in a unified transaction flow.
    """
    # 1. Get or create customer
    customer = get_or_create_customer(
        db, 
        national_id=payload.cin, 
        full_name=f"{payload.firstName} {payload.lastName}", 
        email=payload.email, 
        phone=payload.phone,
        address=payload.address
    )

    # 2. Create a meter (automated/simplified)
    # Default technical parameters based on contractType
    meter_type = "smart" if payload.contractType == "company" else "standard-mono"
    phase_config = "380V" if payload.contractType == "company" else "220V"
    
    meter_number = f"MTR-{uuid.uuid4().hex[:8].upper()}"
    new_meter = models.Meter(
        id_customer=customer.id_customer,
        meter_number=meter_number,
        meter_type=meter_type,
        phase_configuration=phase_config,
        installation_date=datetime.utcnow()
    )
    db.add(new_meter)
    db.commit()
    db.refresh(new_meter)

    # 3. Create the contract
    contract_number = f"CTR-{uuid.uuid4().hex[:8].upper()}"
    subscribed_power = 22.0 if payload.contractType == "company" else (11.0 if payload.contractType == "household" else 6.6)
    
    # Provider mapping (placeholder)
    provider = "ONEE" 
    
    new_contract = models.Contract(
        id_customer=customer.id_customer,
        id_meter=new_meter.id_meter,
        contract_number=contract_number,
        customer_type=payload.contractType,
        provider=provider,
        voltage_level="BT",
        subscribed_power=subscribed_power,
        start_date=datetime.strptime(payload.startDate, "%Y-%m-%d"),
        contract_data={
            "occupants": payload.occupants,
            "ownershipStatus": payload.ownershipStatus,
            "companyName": payload.companyName,
            "registrationNumber": payload.registrationNumber
        }
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    return {
        "message": "Contract created successfully",
        "contract_number": contract_number,
        "customer_id": customer.id_customer,
        "meter_number": meter_number
    }

@app.post("/api/connections/new", status_code=201)
def create_new_connection(payload: schemas.NewConnectionRequest, db: Session = Depends(get_db)):
    """
    Handles requests for new grid connections (installations).
    Logs the request as a specialized complaint for engineering review.
    """
    customer = get_or_create_customer(
        db, 
        national_id=payload.cin, 
        full_name=f"{payload.firstName} {payload.lastName}", 
        email=payload.email, 
        phone=payload.phone,
        address=f"{payload.connectionAddress}, {payload.connectionCity}"
    )

    # For new connections, we usually start with a complaint/request record
    # or a pending meter/contract. Here we create a complaint of type 'connection'
    complaint_number = f"REC-CONN-{uuid.uuid4().hex[:6].upper()}"
    new_complaint = models.Complaint(
        complaint_number=complaint_number,
        id_customer=customer.id_customer,
        complaint_type="New Connection",
        category="Installation",
        subject=f"New connection request for {payload.propertyType}",
        description=f"Address: {payload.connectionAddress}, City: {payload.connectionCity}. Plot: {payload.plotReference}. Estimated Power: {payload.estimatedPower}",
        priority=models.ComplaintPriority.normal
    )
    db.add(new_complaint)
    db.commit()
    
    return {
        "message": "Connection request submitted",
        "reference_number": complaint_number
    }

@app.post("/api/contracts/modify", status_code=200)
def modify_contract(payload: schemas.ModifyContractRequest, db: Session = Depends(get_db)):
    """
    Registers a request to modify an existing contract (power change, address update, etc.).
    """
    # Find existing contract
    contract = db.query(models.Contract).filter(models.Contract.contract_number == payload.contractNumber).first()
    
    # If contract doesn't exist, we still log the request as a complaint for an agent to review
    complaint_number = f"REC-MOD-{uuid.uuid4().hex[:6].upper()}"
    
    customer = get_or_create_customer(
        db, 
        national_id=payload.cin, 
        full_name=f"{payload.firstName} {payload.lastName}", 
        email=payload.email, 
        phone=payload.phone
    )

    new_complaint = models.Complaint(
        complaint_number=complaint_number,
        id_customer=customer.id_customer,
        complaint_type="Modification",
        category=payload.modificationReason,
        subject=f"Contract Modification Request: {payload.contractNumber}",
        description=f"Details: {payload.modificationDetails}. New Info: {payload.newAddress or 'N/A'}, {payload.newCity or 'N/A'}",
        priority=models.ComplaintPriority.normal
    )
    db.add(new_complaint)
    db.commit()

    return {
        "message": "Modification request submitted",
        "reference_number": complaint_number
    }

@app.post("/api/complaints/new", status_code=201)
def create_complaint(payload: schemas.InformationRequest, db: Session = Depends(get_db)):
    """
    General purpose endpoint for information requests and customer complaints.
    """
    customer = get_or_create_customer(
        db, 
        national_id=payload.cin or f"TEMP-{uuid.uuid4().hex[:8]}", 
        full_name=f"{payload.firstName} {payload.lastName}", 
        email=payload.email, 
        phone=payload.phone or ""
    )

    complaint_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
    new_complaint = models.Complaint(
        complaint_number=complaint_number,
        id_customer=customer.id_customer,
        complaint_type="Information Request",
        category="General",
        subject=payload.subject,
        description=payload.message,
        priority=models.ComplaintPriority.normal
    )
    db.add(new_complaint)
    db.commit()

    return {
        "message": "Request submitted successfully",
        "reference_number": complaint_number
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
