from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


# -------------------------
# CREATE CUSTOMER
# -------------------------
@router.post("/", response_model=schemas.CustomerRead)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):

    # Check if national_id already exists
    existing = db.query(models.Customer).filter(
        models.Customer.national_id == customer.national_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Customer with this national_id already exists")

    db_customer = models.Customer(**customer.dict())

    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)

    return db_customer


# -------------------------
# GET ALL CUSTOMERS
# -------------------------
@router.get("/", response_model=list[schemas.CustomerRead])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


# -------------------------
# GET CUSTOMER BY ID
# -------------------------
@router.get("/{customer_id}", response_model=schemas.CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):

    customer = db.query(models.Customer).filter(
        models.Customer.id_customer == customer_id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer
