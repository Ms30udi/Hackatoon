from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


# -------------------------
# CREATE DRAFT CONTRACT (STEP 1)
# -------------------------
@router.post("/draft", response_model=schemas.ContractDraftRead)
def create_contract_draft(data: schemas.ContractDraftCreate, db: Session = Depends(get_db)):

    # 1. Check if customer already exists by national_id
    customer = db.query(models.Customer).filter(
        models.Customer.national_id == data.national_id
    ).first()

    # 2. If not exists, create new customer
    if not customer:
        customer = models.Customer(
            full_name=data.full_name,
            national_id=data.national_id,
            address=data.address,
            phone=data.phone,
            email=data.email,
            status="active"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # 3. Create draft contract
    contract = models.Contract(
        id_customer=customer.id_customer,

        customer_type=data.customer_type,
        provider=data.provider,
        subscribed_power=data.subscribed_power,
        applied_tariff=data.applied_tariff,
        contract_address=data.contract_address,

        status="draft"
    )

    db.add(contract)
    db.commit()
    db.refresh(contract)

    return contract
