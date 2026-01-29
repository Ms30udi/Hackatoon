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

# =====================================================
# STEP 1 — CREATE CONTRACT DRAFT
# =====================================================
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
            status="active"
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


# =====================================================
# STEP 2 — UPLOAD CIN + OCR + LLM + VERIFICATION
# =====================================================
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

    # -----------------------------
    # Save CIN image
    # -----------------------------
    filename = f"{uuid.uuid4()}.png"
    image_path = os.path.join(UPLOAD_DIR, filename)

    with open(image_path, "wb") as f:
        f.write(cin_image.file.read())

    contract.cin_image_path = image_path
    db.commit()

    # -----------------------------
    # OCR extraction
    # -----------------------------
    ocr_texts = extract_text_from_image(image_path)

    if not ocr_texts:
        raise HTTPException(status_code=400, detail="OCR failed to read image")
    
    print(f"[DEBUG] OCR output: {ocr_texts}")
    
    # -----------------------------
    # OCR PRE-CLEAN (🔥 ADD THIS 🔥)
    # -----------------------------
    ocr_texts = preprocess_ocr(ocr_texts)
    print(f"[DEBUG] After preprocess: {ocr_texts}")

    # -----------------------------
    # LLM extraction (Mistral)
    # -----------------------------
    llm_result = extract_identity_with_llm(ocr_texts)
    print(f"[DEBUG] LLM result: {llm_result}")

    extracted_name = llm_result.get("full_name")
    extracted_cin = llm_result.get("national_id")

    print(f"[DEBUG] Extracted name: '{extracted_name}' (type: {type(extracted_name)})")
    print(f"[DEBUG] Extracted CIN: '{extracted_cin}' (type: {type(extracted_cin)})")
    print(f"[DEBUG] DB name: '{customer.full_name}'")
    print(f"[DEBUG] DB CIN: '{customer.national_id}'")

    contract.extracted_name = extracted_name
    contract.extracted_id = extracted_cin

    # -----------------------------
    # Verification logic
    # -----------------------------
    name_match_score = compare_names(customer.full_name, extracted_name)
    cin_match = compare_cin(customer.national_id, extracted_cin)

    print(f"[DEBUG] Name match score: {name_match_score}")
    print(f"[DEBUG] CIN match: {cin_match}")
    print(f"[DEBUG] Condition (score >= 0.8): {name_match_score >= 0.8}")
    print(f"[DEBUG] Condition (cin_match): {cin_match}")
    print(f"[DEBUG] Both conditions: {name_match_score >= 0.8 and cin_match}")

    confidence = round(name_match_score * 100, 2)
    contract.confidence_score = confidence

    if name_match_score >= 0.8 and cin_match:
        contract.verification_status = "verified"
        contract.status = "verified"
    else:
        contract.verification_status = "rejected"
        contract.status = "rejected"
    
    print(f"[DEBUG] Final status: {contract.status}")


    db.commit()

    return {
        "contract_id": contract.id_contract,
        "status": contract.status,
        "verification_status": contract.verification_status,
        "confidence_score": contract.confidence_score,
        "extracted_name": extracted_name,
        "extracted_id": extracted_cin
    }

# =====================================================
# STEP 3 — SEND VERIFICATION EMAIL WITH PDFs
# =====================================================
@router.post("/{contract_id}/send-verification-email")
def send_contract_verification_email(
    contract_id: int,
    db: Session = Depends(get_db)
):
    """
    Send verification email with contract PDFs and e-signature link.
    Only works if contract status is "verified".
    """
    
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

        # Attach static PDFs from app/utils/closes/
        closes_dir = os.path.join(os.path.dirname(__file__), '../utils/closes')
        pdf_paths = [
            os.path.abspath(os.path.join(closes_dir, 'Guide_Explicatif_Clauses.pdf')),
        ]
        print(f"✅ PDFs attached: {pdf_paths}")

        # Configure email settings from environment
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

        # Configure email service
        EmailConfig.configure(
            smtp_server=smtp_server,
            smtp_port=smtp_port,
            sender_email=sender_email,
            sender_password=sender_password,
            frontend_url=frontend_url
        )

        # Send email
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

        # Update contract with email sent timestamp
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
        print(f"❌ Error sending email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error sending email: {str(e)}"
        )


# =====================================================
# STEP 4 — SIGN CONTRACT
# =====================================================
@router.post("/{contract_id}/sign")
def sign_contract(
    contract_id: int,
    signature_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Receive signature image, generate final PDF, store it, and email it.
    """
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

    # 1. Save Signature Image
    signature_filename = f"sig_{contract_id}_{uuid.uuid4()}.png"
    signature_dir = "uploads/signatures"
    os.makedirs(signature_dir, exist_ok=True)
    signature_path = os.path.join(signature_dir, signature_filename)

    try:
        with open(signature_path, "wb") as f:
            f.write(signature_image.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save signature: {e}")

    # 2. Generate Signed PDF
    # Import locally if not at top, but better to use the imported one
    from ..utils.pdf_generator import generate_signed_contract_pdf
    from ..utils.email_service import send_signed_contract_email
    
    # Prepare data for pdf filling
    contract_data = {
        'national_id': customer.national_id,
        'address': customer.address,
        'phone': customer.phone,
        'email': customer.email,
        'contract_address': contract.contract_address,
        'subscribed_power': contract.subscribed_power
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

    # 3. Update Contract
    contract.signature_path = signature_path
    contract.pdf_path = signed_pdf_path
    contract.signed_at = datetime.now()
    contract.status = "signed"
    db.commit()

    # 4. Send Email
    email_sent = send_signed_contract_email(
        recipient_email=customer.email,
        customer_name=customer.full_name,
        contract_id=contract_id,
        signed_pdf_path=signed_pdf_path
    )
    
    if not email_sent:
        print("⚠️ Warning: Failed to send signed contract email")

    return {
        "success": True,
        "contract_id": contract_id,
        "status": "active",
        "message": "Contract signed and activated successfully",
        "pdf_generated": True,
        "email_sent": email_sent
    }