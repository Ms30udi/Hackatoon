from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


# -------------------------
# CREATE COMPLAINT (INTELLIGENT REQUEST ENTRY)
# -------------------------
@router.post("/", response_model=schemas.ComplaintRead)
def create_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(get_db)):

    # Check customer exists
    customer = db.query(models.Customer).filter(
        models.Customer.id_customer == complaint.id_customer
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db_complaint = models.Complaint(**complaint.dict())

    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)

    return db_complaint


# -------------------------
# GET ALL COMPLAINTS
# -------------------------
@router.get("/", response_model=list[schemas.ComplaintRead])
def get_complaints(db: Session = Depends(get_db)):
    return db.query(models.Complaint).all()


# -------------------------
# GET COMPLAINT BY ID
# -------------------------
@router.get("/{complaint_id}", response_model=schemas.ComplaintRead)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):

    complaint = db.query(models.Complaint).filter(
        models.Complaint.id_complaint == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return complaint
