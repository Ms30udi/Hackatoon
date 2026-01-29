from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# -------------------------
# CUSTOMER SCHEMAS
# -------------------------
class CustomerBase(BaseModel):
    full_name: str
    national_id: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = "active"


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id_customer: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# -------------------------
# COMPLAINT SCHEMAS
# -------------------------
class ComplaintBase(BaseModel):
    complaint_number: str
    id_customer: int

    complaint_type: Optional[str] = None
    category: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None

    priority: Optional[str] = "normal"
    due_date: Optional[date] = None
    status: Optional[str] = "open"
    assigned_agent: Optional[str] = None


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintRead(ComplaintBase):
    id_complaint: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# -------------------------
# CONTRACT DRAFT SCHEMAS (STEP 1)
# -------------------------

class ContractDraftCreate(BaseModel):
    # Customer info
    full_name: str
    national_id: str
    address: str
    phone: str
    email: str

    # Contract info
    customer_type: str
    provider: str
    subscribed_power: float
    applied_tariff: str

    # Contract address (can be different from customer address)
    # Contract address (can be different from customer address)
    contract_address: str

    # Enterprise fields (Optional)
    company_name: Optional[str] = None
    legal_form: Optional[str] = None
    trade_register: Optional[str] = None
    ice_number: Optional[str] = None
    legal_representative_name: Optional[str] = None
    legal_representative_cin: Optional[str] = None


class ContractDraftRead(BaseModel):
    id_contract: int
    status: str
    id_customer: int

    class Config:
        from_attributes = True
