import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session


from ..database import get_db
from .. import models, schemas
from ..utils.ocr import extract_text_from_image
from ..utils.mistral_extraction import extract_identity_with_llm, preprocess_ocr
from ..utils.verification import compare_names, compare_cin

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
