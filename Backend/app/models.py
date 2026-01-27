"""
Database Models - Service Intelligence Portal

Defines the SQLAlchemy ORM models representing the energy management 
system's domain entities: Customers, Meters, Contracts, and Complaints.

All models inherit from the common declarative base and implement 
relationship mappings for complex data retrieval.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

# Enums for status fields
class CustomerStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    terminated = "terminated"

class MeterStatus(str, enum.Enum):
    active = "active"
    out_of_service = "out_of_service"
    replaced = "replaced"

class ContractStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    terminated = "terminated"

class ComplaintStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"

class ComplaintPriority(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"

# ============================================================================
# TABLE 1: Customers
# ============================================================================
class Customer(Base):
    __tablename__ = "customers"

    id_customer = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    national_id = Column(String(20), unique=True, nullable=False, index=True)
    address = Column(String(500))
    phone = Column(String(20))
    email = Column(String(255))
    status = Column(SQLEnum(CustomerStatus), default=CustomerStatus.active)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    meters = relationship("Meter", back_populates="customer", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="customer", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="customer", cascade="all, delete-orphan")

# ============================================================================
# TABLE 2: Meters
# ============================================================================
class Meter(Base):
    __tablename__ = "meters"

    id_meter = Column(Integer, primary_key=True, index=True)
    id_customer = Column(Integer, ForeignKey("customers.id_customer"), nullable=False, index=True)
    meter_number = Column(String(50), unique=True, nullable=False, index=True)
    meter_type = Column(String(50))  # mono, tri, smart, etc.
    phase_configuration = Column(String(50))  # 220V, 380V, etc.
    current_index = Column(Float, default=0.0)
    last_reading_date = Column(DateTime)
    status = Column(SQLEnum(MeterStatus), default=MeterStatus.active)
    installation_date = Column(DateTime)
    replacement_due_date = Column(DateTime)

    # Relationships
    customer = relationship("Customer", back_populates="meters")
    contracts = relationship("Contract", back_populates="meter")

# ============================================================================
# TABLE 3: Contracts
# ============================================================================
class Contract(Base):
    __tablename__ = "contracts"

    id_contract = Column(Integer, primary_key=True, index=True)
    id_customer = Column(Integer, ForeignKey("customers.id_customer"), nullable=False, index=True)
    id_meter = Column(Integer, ForeignKey("meters.id_meter"), nullable=False, index=True)

    contract_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_type = Column(String(50))  # individual, company, etc.
    provider = Column(String(100))  # ONEE, REDAL, etc.
    voltage_level = Column(String(50))  # BT, MT, HT
    subscribed_power = Column(Float)  # kVA
    applied_tariff = Column(String(100))

    signature_date = Column(DateTime)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)

    deposit_amount = Column(Float, default=0.0)
    status = Column(SQLEnum(ContractStatus), default=ContractStatus.active)
    contract_data = Column(JSON)  # For future extensions

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="contracts")
    meter = relationship("Meter", back_populates="contracts")

# ============================================================================
# TABLE 4: Tariffs
# ============================================================================
class Tariff(Base):
    __tablename__ = "tariffs"

    id_tariff = Column(Integer, primary_key=True, index=True)
    tariff_name = Column(String(100), nullable=False)
    customer_type = Column(String(50))  # individual, company, etc.
    price_per_kwh = Column(Float)  # in currency units
    subscription_fee = Column(Float, default=0.0)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    reference_document = Column(String(255))  # Link to tarification.json or document

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============================================================================
# TABLE 5: Complaints
# ============================================================================
class Complaint(Base):
    __tablename__ = "complaints"

    id_complaint = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, nullable=False, index=True)  # REC-2026-00001 format
    id_customer = Column(Integer, ForeignKey("customers.id_customer"), nullable=False, index=True)

    complaint_type = Column(String(50))  # billing, meter, contract, outage, etc.
    category = Column(String(50))  # optional, can be merged with type

    subject = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=False)

    priority = Column(SQLEnum(ComplaintPriority), default=ComplaintPriority.normal)

    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)  # Auto-calculated from type SLA

    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.open)
    assigned_agent = Column(String(100))  # Agent name or ID

    proposed_solutions = Column(JSON)  # Can store list of solutions
    attached_documents = Column(JSON)  # Can store file paths or metadata

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="complaints")