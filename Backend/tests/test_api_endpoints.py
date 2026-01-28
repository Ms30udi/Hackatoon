"""
API Endpoint Tests - Service Intelligence Portal

Tests for all form submission endpoints:
- POST /api/contracts/new
- POST /api/connections/new
- POST /api/contracts/modify
- POST /api/complaints/new
"""

import pytest


class TestHealthEndpoints:
    """Tests for health check endpoints"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Backend running"
        assert "version" in data

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data


class TestNewContractEndpoint:
    """Tests for POST /api/contracts/new"""

    def test_create_new_contract_success(self, client, sample_new_contract_data):
        """Test successful contract creation"""
        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Contract created successfully"
        assert "contract_number" in data
        assert data["contract_number"].startswith("CTR-")
        assert "customer_id" in data
        assert "meter_number" in data
        assert data["meter_number"].startswith("MTR-")

    def test_create_contract_company_type(self, client, sample_new_contract_data):
        """Test contract creation for company type"""
        sample_new_contract_data["contractType"] = "company"
        sample_new_contract_data["companyName"] = "Test Company SARL"
        sample_new_contract_data["registrationNumber"] = "RC123456"

        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        assert response.status_code == 201
        data = response.json()
        assert "contract_number" in data

    def test_create_contract_household_type(self, client, sample_new_contract_data):
        """Test contract creation for household type"""
        sample_new_contract_data["contractType"] = "household"
        sample_new_contract_data["occupants"] = 4
        sample_new_contract_data["ownershipStatus"] = "owner"

        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        assert response.status_code == 201

    def test_create_contract_invalid_email(self, client, sample_new_contract_data):
        """Test contract creation with invalid email fails"""
        sample_new_contract_data["email"] = "invalid-email"

        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        assert response.status_code == 422  # Validation error

    def test_create_contract_missing_required_field(self, client, sample_new_contract_data):
        """Test contract creation with missing required field fails"""
        del sample_new_contract_data["cin"]

        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        assert response.status_code == 422

    def test_create_contract_duplicate_customer(self, client, sample_new_contract_data):
        """Test that same customer can create multiple contracts"""
        # Create first contract
        response1 = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response1.status_code == 201
        customer_id_1 = response1.json()["customer_id"]

        # Create second contract with same customer data
        sample_new_contract_data["startDate"] = "2026-03-01"
        response2 = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response2.status_code == 201
        customer_id_2 = response2.json()["customer_id"]

        # Should reuse the same customer
        assert customer_id_1 == customer_id_2


class TestNewConnectionEndpoint:
    """Tests for POST /api/connections/new"""

    def test_create_new_connection_success(self, client, sample_new_connection_data):
        """Test successful connection request"""
        response = client.post("/api/connections/new", json=sample_new_connection_data)

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Connection request submitted"
        assert "reference_number" in data
        assert data["reference_number"].startswith("REC-CONN-")

    def test_create_connection_invalid_email(self, client, sample_new_connection_data):
        """Test connection request with invalid email fails"""
        sample_new_connection_data["email"] = "not-an-email"

        response = client.post("/api/connections/new", json=sample_new_connection_data)

        assert response.status_code == 422


class TestModifyContractEndpoint:
    """Tests for POST /api/contracts/modify"""

    def test_modify_contract_success(self, client, sample_modify_contract_data):
        """Test successful contract modification request"""
        response = client.post("/api/contracts/modify", json=sample_modify_contract_data)

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Modification request submitted"
        assert "reference_number" in data
        assert data["reference_number"].startswith("REC-MOD-")

    def test_modify_contract_minimal_data(self, client, sample_modify_contract_data):
        """Test modification with only required fields"""
        minimal_data = {
            "contractNumber": "CTR-MIN12345",
            "cin": "ZZ000000",
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com",
            "phone": "+212600000000",
            "modificationReason": "power_change",
            "modificationDetails": "Increase power to 9kVA"
        }

        response = client.post("/api/contracts/modify", json=minimal_data)

        assert response.status_code == 200


class TestComplaintEndpoint:
    """Tests for POST /api/complaints/new"""

    def test_create_complaint_success(self, client, sample_information_request_data):
        """Test successful information request/complaint creation"""
        response = client.post("/api/complaints/new", json=sample_information_request_data)

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Request submitted successfully"
        assert "reference_number" in data
        assert data["reference_number"].startswith("REC-")

    def test_create_complaint_without_cin(self, client, sample_information_request_data):
        """Test complaint creation without CIN (should generate temp ID)"""
        del sample_information_request_data["cin"]

        response = client.post("/api/complaints/new", json=sample_information_request_data)

        assert response.status_code == 201

    def test_create_complaint_without_phone(self, client, sample_information_request_data):
        """Test complaint creation without phone (optional field)"""
        del sample_information_request_data["phone"]

        response = client.post("/api/complaints/new", json=sample_information_request_data)

        assert response.status_code == 201


class TestDataPersistence:
    """Tests to verify data is correctly stored in database tables"""

    def test_customer_created_and_stored(self, client, db_session, sample_new_contract_data):
        """Test that customer data is persisted in database"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        # Query database directly
        customer = db_session.query(models.Customer).filter(
            models.Customer.national_id == sample_new_contract_data["cin"]
        ).first()

        assert customer is not None
        assert customer.full_name == f"{sample_new_contract_data['firstName']} {sample_new_contract_data['lastName']}"
        assert customer.email == sample_new_contract_data["email"]
        assert customer.phone == sample_new_contract_data["phone"]

    def test_meter_created_and_stored(self, client, db_session, sample_new_contract_data):
        """Test that meter data is persisted in database"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        meter_number = response.json()["meter_number"]

        # Query database directly
        meter = db_session.query(models.Meter).filter(
            models.Meter.meter_number == meter_number
        ).first()

        assert meter is not None
        assert meter.status == models.MeterStatus.active

    def test_contract_created_and_stored(self, client, db_session, sample_new_contract_data):
        """Test that contract data is persisted in database"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        contract_number = response.json()["contract_number"]

        # Query database directly
        contract = db_session.query(models.Contract).filter(
            models.Contract.contract_number == contract_number
        ).first()

        assert contract is not None
        assert contract.customer_type == sample_new_contract_data["contractType"]
        assert contract.status == models.ContractStatus.active

    def test_complaint_created_and_stored(self, client, db_session, sample_new_connection_data):
        """Test that connection request creates complaint in database"""
        from app import models

        response = client.post("/api/connections/new", json=sample_new_connection_data)
        assert response.status_code == 201

        reference = response.json()["reference_number"]

        # Query database directly
        complaint = db_session.query(models.Complaint).filter(
            models.Complaint.complaint_number == reference
        ).first()

        assert complaint is not None
        assert complaint.complaint_type == "New Connection"
        assert complaint.status == models.ComplaintStatus.open
