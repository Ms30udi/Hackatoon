import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from .. import models, schemas
from ..utils.ocr import extract_text_from_image
from ..utils.mistral_extraction import extract_identity_with_llm, preprocess_ocr
from ..utils.verification import compare_names, compare_cin
from ..utils.pdf_generator import generate_verification_email_pdfs
from ..utils.email_service import send_verification_email, EmailConfig

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)

UPLOAD_DIR = "uploads/cin"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# create contract draft
@router.post("/draft", response_model=schemas.ContractDraftRead)
def create_contract_draft(
    data: schemas.ContractDraftCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(models.Customer).filter(
        models.Customer.national_id == data.national_id
    ).first()

    if not customer:
        customer = models.Customer(
            full_name=data.full_name,
            national_id=data.national_id,
            address=data.address,
            phone=data.phone,
            email=data.email,
            status="active",
            # Enterprise fields
            company_name=data.company_name,
            legal_form=data.legal_form,
            trade_register=data.trade_register,
            ice_number=data.ice_number,
            legal_representative_name=data.legal_representative_name,
            legal_representative_cin=data.legal_representative_cin,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

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


# upload CIN and verify identity
@router.post("/{contract_id}/upload-cin")
def upload_cin_and_verify(
    contract_id: int,
    cin_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contract = db.query(models.Contract).filter(
        models.Contract.id_contract == contract_id
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    customer = db.query(models.Customer).filter(
        models.Customer.id_customer == contract.id_customer
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # save image
    filename = f"{uuid.uuid4()}.png"
    image_path = os.path.join(UPLOAD_DIR, filename)

    with open(image_path, "wb") as f:
        f.write(cin_image.file.read())

    contract.cin_image_path = image_path
    db.commit()

    # extract text with OCR
    ocr_texts = extract_text_from_image(image_path)

    if not ocr_texts:
        raise HTTPException(status_code=400, detail="OCR failed to read image")
    
    ocr_texts = preprocess_ocr(ocr_texts)

    # use LLM to extract identity data
    llm_result = extract_identity_with_llm(ocr_texts)

    extracted_name = llm_result.get("full_name")
    extracted_cin = llm_result.get("national_id")

    contract.extracted_name = extracted_name
    contract.extracted_id = extracted_cin

    # verify against database
    name_match_score = compare_names(customer.full_name, extracted_name)
    cin_match = compare_cin(customer.national_id, extracted_cin)

    confidence = round(name_match_score * 100, 2)
    contract.confidence_score = confidence

    if name_match_score >= 0.8 and cin_match:
        contract.verification_status = "verified"
        contract.status = "verified"
    else:
        contract.verification_status = "rejected"
        contract.status = "rejected"


    db.commit()

    return {
        "contract_id": contract.id_contract,
        "status": contract.status,
        "verification_status": contract.verification_status,
        "confidence_score": contract.confidence_score,
        "extracted_name": extracted_name,
        "extracted_id": extracted_cin
    }

# send verification email
@router.post("/{contract_id}/send-verification-email")
def send_contract_verification_email(
    contract_id: int,
    db: Session = Depends(get_db)
):
    
    contract = db.query(models.Contract).filter(
        models.Contract.id_contract == contract_id
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.status != "verified":
        raise HTTPException(
            status_code=400,
            detail=f"Contract must be verified before sending email. Current status: {contract.status}"
        )

    customer = db.query(models.Customer).filter(
        models.Customer.id_customer == contract.id_customer
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:

        # attach PDFs
        closes_dir = os.path.join(os.path.dirname(__file__), '../utils/closes')
        pdf_paths = [
            os.path.abspath(os.path.join(closes_dir, 'Guide_Explicatif_Clauses.pdf')),
        ]

        # get email config from env
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        sender_email = os.getenv("SENDER_EMAIL")
        sender_password = os.getenv("SENDER_PASSWORD")
        frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")

        if not sender_email or not sender_password:
            raise HTTPException(
                status_code=500,
                detail="Email service not configured. Set SENDER_EMAIL and SENDER_PASSWORD in environment."
            )

        # setup email service
        EmailConfig.configure(
            smtp_server=smtp_server,
            smtp_port=smtp_port,
            sender_email=sender_email,
            sender_password=sender_password,
            frontend_url=frontend_url
        )

        # send email
        email_sent = send_verification_email(
            recipient_email=customer.email,
            customer_name=customer.full_name,
            contract_id=contract_id,
            pdf_paths=pdf_paths
        )

        if not email_sent:
            raise HTTPException(
                status_code=500,
                detail="Failed to send verification email"
            )

        # update contract status
        contract.status = "email_sent"
        db.commit()

        return {
            "success": True,
            "message": "Verification email sent successfully",
            "contract_id": contract_id,
            "customer_email": customer.email,
            "pdfs_generated": len(pdf_paths)
        }

    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error sending email: {str(e)}"
        )


# sign contract
@router.post("/{contract_id}/sign")
def sign_contract(
    contract_id: int,
    signature_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contract = db.query(models.Contract).filter(
        models.Contract.id_contract == contract_id
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    customer = db.query(models.Customer).filter(
        models.Customer.id_customer == contract.id_customer
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # save signature image
    signature_filename = f"sig_{contract_id}_{uuid.uuid4()}.png"
    signature_dir = "uploads/signatures"
    os.makedirs(signature_dir, exist_ok=True)
    signature_path = os.path.join(signature_dir, signature_filename)

    try:
        with open(signature_path, "wb") as f:
            f.write(signature_image.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save signature: {e}")

    # generate PDF with signature
    from ..utils.pdf_generator import generate_signed_contract_pdf
    from ..utils.email_service import send_signed_contract_email
    
    contract_data = {
        'national_id': customer.national_id,
        'address': customer.address,
        'phone': customer.phone,
        'email': customer.email,
        'contract_address': contract.contract_address,
        'subscribed_power': contract.subscribed_power,
        # Enterprise fields
        'company_name': customer.company_name,
        'legal_form': customer.legal_form,
        'trade_register': customer.trade_register,
        'ice_number': customer.ice_number,
        'legal_representative_name': customer.legal_representative_name,
        'legal_representative_cin': customer.legal_representative_cin,
    }

    signed_pdf_path = generate_signed_contract_pdf(
        contract_id=contract_id,
        signature_image_path=os.path.abspath(signature_path),
        customer_name=customer.full_name,
        customer_type=contract.customer_type,
        contract_data=contract_data
    )

    if not signed_pdf_path or not os.path.exists(signed_pdf_path):
        raise HTTPException(status_code=500, detail="Failed to generate signed contract PDF")

    # update contract in database
    contract.signature_path = signature_path
    contract.pdf_path = signed_pdf_path
    contract.signed_at = datetime.now()
    contract.status = "signed"
    db.commit()

    # send signed contract to customer
    email_sent = send_signed_contract_email(
        recipient_email=customer.email,
        customer_name=customer.full_name,
        contract_id=contract_id,
        signed_pdf_path=signed_pdf_path
    )
    
    if not email_sent:
        print("Warning: Failed to send signed contract email")

    return {
        "success": True,
        "contract_id": contract_id,
        "status": "active",
        "message": "Contract signed and activated successfully",
        "pdf_generated": True,
        "email_sent": email_sent
    }