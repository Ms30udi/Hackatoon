"""
Data Schemas - Service Intelligence Portal

Defines Pydantic models for data validation, serialization, and 
API request/response payloads. Ensures type safety and consistent 
data structures across the application layers.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from .models import CustomerStatus, MeterStatus, ContractStatus, ComplaintStatus, ComplaintPriority

# Base Schemas
class CustomerBase(BaseModel):
    full_name: str
    national_id: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id_customer: int
    status: CustomerStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MeterBase(BaseModel):
    meter_number: str
    meter_type: Optional[str] = None
    phase_configuration: Optional[str] = None
    current_index: float = 0.0
    status: MeterStatus = MeterStatus.active
    installation_date: Optional[datetime] = None

class MeterCreate(MeterBase):
    id_customer: int

class Meter(MeterBase):
    id_meter: int
    id_customer: int

    class Config:
        from_attributes = True

class ContractBase(BaseModel):
    contract_number: str
    customer_type: Optional[str] = None
    provider: Optional[str] = None
    voltage_level: Optional[str] = None
    subscribed_power: Optional[float] = None
    applied_tariff: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    deposit_amount: float = 0.0
    status: ContractStatus = ContractStatus.active
    contract_data: Optional[Any] = None

class ContractCreate(ContractBase):
    id_customer: int
    id_meter: int

class Contract(ContractBase):
    id_contract: int
    id_customer: int
    id_meter: int

    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    complaint_number: str
    complaint_type: Optional[str] = None
    category: Optional[str] = None
    subject: str
    description: str
    priority: ComplaintPriority = ComplaintPriority.normal
    status: ComplaintStatus = ComplaintStatus.open

class ComplaintCreate(ComplaintBase):
    id_customer: int

class Complaint(ComplaintBase):
    id_complaint: int
    id_customer: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Unified Form Request Schemas
class NewContractRequest(BaseModel):
    cin: str
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    address: str
    city: str
    postalCode: str
    contractType: str
    startDate: str
    # Optional fields
    occupants: Optional[int] = None
    ownershipStatus: Optional[str] = None
    companyName: Optional[str] = None
    registrationNumber: Optional[str] = None
    companyAddress: Optional[str] = None
    legalRepresentative: Optional[str] = None
    businessContact: Optional[str] = None

class NewConnectionRequest(BaseModel):
    cin: str
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    connectionAddress: str
    connectionCity: str
    connectionPostalCode: str
    contractType: str
    propertyType: str
    plotReference: Optional[str] = None
    estimatedPower: Optional[str] = None
    # Optional fields
    companyName: Optional[str] = None
    registrationNumber: Optional[str] = None

class ModifyContractRequest(BaseModel):
    contractNumber: str
    cin: str
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    modificationReason: str
    modificationDetails: str
    newAddress: Optional[str] = None
    newCity: Optional[str] = None
    newPostalCode: Optional[str] = None

class InformationRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    cin: Optional[str] = None # Added CIN for customer tracking
