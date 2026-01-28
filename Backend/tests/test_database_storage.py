"""
Database Storage Verification Tests - Service Intelligence Portal

Comprehensive tests to verify that all form submissions correctly
store data in the appropriate database tables with proper relationships.
"""

import pytest
from datetime import datetime


class TestCustomerTableStorage:
    """Verify Customer table storage"""

    def test_customer_fields_stored_correctly(self, client, db_session, sample_new_contract_data):
        """Verify all customer fields are stored correctly"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        customer = db_session.query(models.Customer).filter(
            models.Customer.national_id == sample_new_contract_data["cin"]
        ).first()

        assert customer is not None
        assert customer.full_name == f"{sample_new_contract_data['firstName']} {sample_new_contract_data['lastName']}"
        assert customer.national_id == sample_new_contract_data["cin"]
        assert customer.email == sample_new_contract_data["email"]
        assert customer.phone == sample_new_contract_data["phone"]
        assert customer.address == sample_new_contract_data["address"]
        assert customer.status == models.CustomerStatus.active
        assert customer.created_at is not None
        assert customer.updated_at is not None

    def test_customer_not_duplicated(self, client, db_session, sample_new_contract_data):
        """Verify same customer is not duplicated on multiple requests"""
        from app import models

        # First request
        client.post("/api/contracts/new", json=sample_new_contract_data)

        # Second request with same CIN
        sample_new_contract_data["startDate"] = "2026-03-01"
        client.post("/api/contracts/new", json=sample_new_contract_data)

        # Should only have one customer
        customer_count = db_session.query(models.Customer).filter(
            models.Customer.national_id == sample_new_contract_data["cin"]
        ).count()

        assert customer_count == 1


class TestMeterTableStorage:
    """Verify Meter table storage"""

    def test_meter_fields_stored_correctly(self, client, db_session, sample_new_contract_data):
        """Verify all meter fields are stored correctly"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        meter_number = response.json()["meter_number"]
        meter = db_session.query(models.Meter).filter(
            models.Meter.meter_number == meter_number
        ).first()

        assert meter is not None
        assert meter.meter_number.startswith("MTR-")
        assert meter.meter_type == "standard-mono"  # individual contract type
        assert meter.phase_configuration == "220V"
        assert meter.status == models.MeterStatus.active
        assert meter.installation_date is not None
        assert meter.id_customer is not None

    def test_meter_type_varies_by_contract_type(self, client, db_session, sample_new_contract_data):
        """Verify meter type changes based on contract type"""
        from app import models

        # Company contract should get smart meter
        sample_new_contract_data["contractType"] = "company"
        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        meter_number = response.json()["meter_number"]
        meter = db_session.query(models.Meter).filter(
            models.Meter.meter_number == meter_number
        ).first()

        assert meter.meter_type == "smart"
        assert meter.phase_configuration == "380V"

    def test_meter_linked_to_customer(self, client, db_session, sample_new_contract_data):
        """Verify meter is properly linked to customer"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        customer_id = response.json()["customer_id"]
        meter_number = response.json()["meter_number"]

        meter = db_session.query(models.Meter).filter(
            models.Meter.meter_number == meter_number
        ).first()

        assert meter.id_customer == customer_id


class TestContractTableStorage:
    """Verify Contract table storage"""

    def test_contract_fields_stored_correctly(self, client, db_session, sample_new_contract_data):
        """Verify all contract fields are stored correctly"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        contract_number = response.json()["contract_number"]
        contract = db_session.query(models.Contract).filter(
            models.Contract.contract_number == contract_number
        ).first()

        assert contract is not None
        assert contract.contract_number.startswith("CTR-")
        assert contract.customer_type == sample_new_contract_data["contractType"]
        assert contract.provider == "ONEE"
        assert contract.voltage_level == "BT"
        assert contract.subscribed_power == 6.6  # individual type
        assert contract.status == models.ContractStatus.active
        assert contract.start_date is not None
        assert contract.created_at is not None

    def test_contract_power_by_type(self, client, db_session):
        """Verify subscribed power varies by contract type"""
        from app import models

        # Test household type
        household_data = {
            "cin": "HH123456",
            "firstName": "Test",
            "lastName": "Household",
            "email": "household@test.com",
            "phone": "+212600000001",
            "address": "Test Address",
            "city": "Casablanca",
            "postalCode": "20000",
            "contractType": "household",
            "startDate": "2026-02-01"
        }
        response = client.post("/api/contracts/new", json=household_data)
        contract = db_session.query(models.Contract).filter(
            models.Contract.contract_number == response.json()["contract_number"]
        ).first()
        assert contract.subscribed_power == 11.0

        # Test company type
        company_data = {
            "cin": "CC123456",
            "firstName": "Test",
            "lastName": "Company",
            "email": "company@test.com",
            "phone": "+212600000002",
            "address": "Test Address",
            "city": "Casablanca",
            "postalCode": "20000",
            "contractType": "company",
            "startDate": "2026-02-01"
        }
        response = client.post("/api/contracts/new", json=company_data)
        contract = db_session.query(models.Contract).filter(
            models.Contract.contract_number == response.json()["contract_number"]
        ).first()
        assert contract.subscribed_power == 22.0

    def test_contract_data_json_stored(self, client, db_session, sample_new_contract_data):
        """Verify contract_data JSON field stores additional info"""
        from app import models

        sample_new_contract_data["contractType"] = "household"
        sample_new_contract_data["occupants"] = 4
        sample_new_contract_data["ownershipStatus"] = "owner"

        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        contract = db_session.query(models.Contract).filter(
            models.Contract.contract_number == response.json()["contract_number"]
        ).first()

        assert contract.contract_data is not None
        assert contract.contract_data.get("occupants") == 4
        assert contract.contract_data.get("ownershipStatus") == "owner"

    def test_contract_linked_to_customer_and_meter(self, client, db_session, sample_new_contract_data):
        """Verify contract is properly linked to customer and meter"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)

        contract_number = response.json()["contract_number"]
        customer_id = response.json()["customer_id"]

        contract = db_session.query(models.Contract).filter(
            models.Contract.contract_number == contract_number
        ).first()

        assert contract.id_customer == customer_id
        assert contract.id_meter is not None


class TestComplaintTableStorage:
    """Verify Complaint table storage"""

    def test_connection_complaint_stored(self, client, db_session, sample_new_connection_data):
        """Verify new connection creates complaint record"""
        from app import models

        response = client.post("/api/connections/new", json=sample_new_connection_data)
        assert response.status_code == 201

        reference = response.json()["reference_number"]
        complaint = db_session.query(models.Complaint).filter(
            models.Complaint.complaint_number == reference
        ).first()

        assert complaint is not None
        assert complaint.complaint_type == "New Connection"
        assert complaint.category == "Installation"
        assert complaint.status == models.ComplaintStatus.open
        assert complaint.priority == models.ComplaintPriority.normal
        assert sample_new_connection_data["propertyType"] in complaint.subject

    def test_modification_complaint_stored(self, client, db_session, sample_modify_contract_data):
        """Verify modification request creates complaint record"""
        from app import models

        response = client.post("/api/contracts/modify", json=sample_modify_contract_data)
        assert response.status_code == 200

        reference = response.json()["reference_number"]
        complaint = db_session.query(models.Complaint).filter(
            models.Complaint.complaint_number == reference
        ).first()

        assert complaint is not None
        assert complaint.complaint_type == "Modification"
        assert complaint.category == sample_modify_contract_data["modificationReason"]
        assert sample_modify_contract_data["contractNumber"] in complaint.subject

    def test_information_request_complaint_stored(self, client, db_session, sample_information_request_data):
        """Verify information request creates complaint record"""
        from app import models

        response = client.post("/api/complaints/new", json=sample_information_request_data)
        assert response.status_code == 201

        reference = response.json()["reference_number"]
        complaint = db_session.query(models.Complaint).filter(
            models.Complaint.complaint_number == reference
        ).first()

        assert complaint is not None
        assert complaint.complaint_type == "Information Request"
        assert complaint.subject == sample_information_request_data["subject"]
        assert complaint.description == sample_information_request_data["message"]

    def test_complaint_linked_to_customer(self, client, db_session, sample_new_connection_data):
        """Verify complaint is properly linked to customer"""
        from app import models

        response = client.post("/api/connections/new", json=sample_new_connection_data)

        reference = response.json()["reference_number"]
        complaint = db_session.query(models.Complaint).filter(
            models.Complaint.complaint_number == reference
        ).first()

        customer = db_session.query(models.Customer).filter(
            models.Customer.national_id == sample_new_connection_data["cin"]
        ).first()

        assert complaint.id_customer == customer.id_customer


class TestRelationshipIntegrity:
    """Test database relationship integrity"""

    def test_full_contract_creation_chain(self, client, db_session, sample_new_contract_data):
        """Test complete chain: Customer -> Meter -> Contract"""
        from app import models

        response = client.post("/api/contracts/new", json=sample_new_contract_data)
        assert response.status_code == 201

        # Verify chain
        customer = db_session.query(models.Customer).filter(
            models.Customer.national_id == sample_new_contract_data["cin"]
        ).first()

        assert customer is not None
        assert len(customer.meters) >= 1
        assert len(customer.contracts) >= 1

        # Verify meter belongs to customer
        meter = customer.meters[0]
        assert meter.id_customer == customer.id_customer

        # Verify contract belongs to customer and meter
        contract = customer.contracts[0]
        assert contract.id_customer == customer.id_customer
        assert contract.id_meter == meter.id_meter
