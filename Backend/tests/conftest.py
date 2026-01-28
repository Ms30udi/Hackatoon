"""
Test Configuration - Service Intelligence Portal

Provides pytest fixtures for API testing including:
- FastAPI TestClient setup
- Database session management with rollback
- Test data factories
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


# Test data factories
@pytest.fixture
def sample_new_contract_data():
    """Sample data for new contract creation"""
    return {
        "cin": "AB123456",
        "firstName": "Ahmed",
        "lastName": "Bennani",
        "email": "ahmed.bennani@test.com",
        "phone": "+212600000001",
        "address": "123 Avenue Mohammed V",
        "city": "Casablanca",
        "postalCode": "20000",
        "contractType": "individual",
        "startDate": "2026-02-01"
    }


@pytest.fixture
def sample_new_connection_data():
    """Sample data for new connection request"""
    return {
        "cin": "CD789012",
        "firstName": "Fatima",
        "lastName": "Alaoui",
        "email": "fatima.alaoui@test.com",
        "phone": "+212600000002",
        "connectionAddress": "456 Rue Hassan II",
        "connectionCity": "Rabat",
        "connectionPostalCode": "10000",
        "contractType": "household",
        "propertyType": "apartment",
        "plotReference": "LOT-2026-001",
        "estimatedPower": "6kVA"
    }


@pytest.fixture
def sample_modify_contract_data():
    """Sample data for contract modification"""
    return {
        "contractNumber": "CTR-TEST1234",
        "cin": "EF345678",
        "firstName": "Karim",
        "lastName": "Idrissi",
        "email": "karim.idrissi@test.com",
        "phone": "+212600000003",
        "modificationReason": "address_change",
        "modificationDetails": "Moving to new residence",
        "newAddress": "789 Boulevard Zerktouni",
        "newCity": "Marrakech",
        "newPostalCode": "40000"
    }


@pytest.fixture
def sample_information_request_data():
    """Sample data for information request"""
    return {
        "firstName": "Leila",
        "lastName": "Chakir",
        "email": "leila.chakir@test.com",
        "phone": "+212600000004",
        "subject": "Tariff Information",
        "message": "I would like to know about the current electricity tariffs for household usage.",
        "cin": "GH901234"
    }
