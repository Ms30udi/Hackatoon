from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Text,
    JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


# -------------------------
# CUSTOMERS
# -------------------------
class Customer(Base):
    __tablename__ = "customers"

    id_customer = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    national_id = Column(String(50), unique=True, nullable=False)
    address = Column(String(255))
    phone = Column(String(30))
    email = Column(String(150))
    status = Column(String(50), default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    contracts = relationship("Contract", back_populates="customer", cascade="all, delete-orphan")
    meters = relationship("Meter", back_populates="customer", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="customer", cascade="all, delete-orphan")


# -------------------------
# METERS
# -------------------------
class Meter(Base):
    __tablename__ = "meters"

    id_meter = Column(Integer, primary_key=True, index=True)
    id_customer = Column(Integer, ForeignKey("customers.id_customer"), nullable=False)

    meter_number = Column(String(100), unique=True, nullable=False)
    meter_type = Column(String(50))
    phase_configuration = Column(String(50))
    current_index = Column(Float, default=0)
    last_reading_date = Column(Date)

    status = Column(String(50), default="active")
    installation_date = Column(Date)
    replacement_due_date = Column(Date)

    # Relationships
    customer = relationship("Customer", back_populates="meters")


# -------------------------
# TARIFFS
# -------------------------
class Tariff(Base):
    __tablename__ = "tariffs"

    id_tariff = Column(Integer, primary_key=True, index=True)
    tariff_name = Column(String(100), nullable=False)
    customer_type = Column(String(50))
    price_per_kwh = Column(Float, nullable=False)
    subscription_fee = Column(Float, nullable=False)

    start_date = Column(Date)
    end_date = Column(Date)
    reference_document = Column(String(255))


# -------------------------
# CONTRACTS (DRAFT + FINAL)
# -------------------------
class Contract(Base):
    __tablename__ = "contracts"

    id_contract = Column(Integer, primary_key=True, index=True)

    # Link to customer
    id_customer = Column(Integer, ForeignKey("customers.id_customer"), nullable=False)

    # Basic contract info (STEP 1)
    contract_number = Column(String(100), unique=True, nullable=True)

    customer_type = Column(String(50))            # individual, company
    provider = Column(String(100))
    subscribed_power = Column(Float)
    applied_tariff = Column(String(100))

    # Address specific to this contract
    contract_address = Column(String(255))

    # Status of pipeline
    status = Column(String(50), default="draft")  # draft, verified, signed, active, rejected

    # Identity verification fields (STEP 2)
    cin_image_path = Column(String(255), nullable=True)
    extracted_name = Column(String(150), nullable=True)
    extracted_id = Column(String(100), nullable=True)
    verification_status = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)

    # Signature fields (STEP 4)
    signature_path = Column(String(255), nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)

    # PDF document (STEP 5)
    pdf_path = Column(String(255), nullable=True)

    # Dates
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="contracts")


# -------------------------
# COMPLAINTS (INTELLIGENT REQUESTS)
# -------------------------
class Complaint(Base):
    __tablename__ = "complaints"

    id_complaint = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(100), unique=True, nullable=False)

    id_customer = Column(Integer, ForeignKey("customers.id_customer"), nullable=False)

    complaint_type = Column(String(100))     # billing, contract, meter, outage...
    category = Column(String(100))

    subject = Column(String(255))
    description = Column(Text)

    priority = Column(String(50), default="normal")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(Date)

    status = Column(String(50), default="open")

    assigned_agent = Column(String(100))

    proposed_solutions = Column(JSON, nullable=True)
    attached_documents = Column(JSON, nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="complaints")
