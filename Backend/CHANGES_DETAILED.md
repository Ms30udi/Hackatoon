# Before vs After Code Changes

## Fix 1: JSON Parsing in mistral_extraction.py

### BEFORE (Lines 76-85)
```python
    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except Exception:
        return {
            "full_name": None,
            "national_id": None
        }
```

### AFTER (Lines 76-99)
```python
    content = response.choices[0].message.content.strip()
    print(f"[DEBUG Mistral] Raw response: {content}")

    try:
        result = json.loads(content)
        print(f"[DEBUG Mistral] Parsed result: {result}")
        return result
    except json.JSONDecodeError as e:
        print(f"[DEBUG Mistral] JSON parsing failed: {e}")
        # Try to extract JSON from the response if it contains extra text
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                print(f"[DEBUG Mistral] Extracted JSON from text: {result}")
                return result
            except json.JSONDecodeError:
                pass
        print(f"[DEBUG Mistral] Content was: {content}")
        return {
            "full_name": None,
            "national_id": None
        }
```

**Why**: Handles cases where LLM returns valid JSON embedded in explanatory text.

---

## Fix 2: CIN Comparison in verification.py

### BEFORE (Lines 39-43)
```python
def compare_cin(db_cin: str, extracted_cin: str) -> bool:
    """
    CIN comparison must be exact (case-insensitive).
    """
    if not db_cin or not extracted_cin:
        return False

    return db_cin.strip().upper() == extracted_cin.strip().upper()
```

### AFTER (Lines 39-55)
```python
def compare_cin(db_cin: str, extracted_cin: str) -> bool:
    """
    CIN comparison must be exact (case-insensitive).
    """
    if not db_cin or not extracted_cin:
        print(f"[DEBUG verify] compare_cin: db_cin={db_cin}, extracted_cin={extracted_cin} → returning False")
        return False

    # Normalize: uppercase and remove all whitespace
    db_normalized = db_cin.strip().upper().replace(" ", "").replace("-", "")
    ext_normalized = extracted_cin.strip().upper().replace(" ", "").replace("-", "")
    
    result = db_normalized == ext_normalized
    print(f"[DEBUG verify] compare_cin: '{db_cin}' → '{db_normalized}' vs '{extracted_cin}' → '{ext_normalized}' = {result}")
    return result
```

**Why**: Handles CIN strings with internal spaces or hyphens (e.g., "AB 123456" or "AB-123456" vs "AB123456").

---

## Fix 3: API Response in contracts.py

### BEFORE (Lines 157-163)
```python
    return {
        "contract_id": contract.id_contract,
        "verification_status": contract.verification_status,
        "confidence_score": contract.confidence_score,
        "extracted_name": extracted_name,
        "extracted_id": extracted_cin
    }
```

### AFTER (Lines 159-166)
```python
    return {
        "contract_id": contract.id_contract,
        "status": contract.status,
        "verification_status": contract.verification_status,
        "confidence_score": contract.confidence_score,
        "extracted_name": extracted_name,
        "extracted_id": extracted_cin
    }
```

**Why**: Includes both `status` and `verification_status` for clarity on contract state.

---

## Fix 4: Debug Logging in contracts.py

### BEFORE (Lines 99-125)
```python
    # OCR extraction
    ocr_texts = extract_text_from_image(image_path)

    if not ocr_texts:
        raise HTTPException(status_code=400, detail="OCR failed to read image")
    
    # OCR PRE-CLEAN
    ocr_texts = preprocess_ocr(ocr_texts)

    # LLM extraction (Mistral)
    llm_result = extract_identity_with_llm(ocr_texts)

    extracted_name = llm_result.get("full_name")
    extracted_cin = llm_result.get("national_id")

    contract.extracted_name = extracted_name
    contract.extracted_id = extracted_cin

    # Verification logic
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
```

### AFTER (Lines 99-155)
```python
    # OCR extraction
    ocr_texts = extract_text_from_image(image_path)

    if not ocr_texts:
        raise HTTPException(status_code=400, detail="OCR failed to read image")
    
    print(f"[DEBUG] OCR output: {ocr_texts}")
    
    # OCR PRE-CLEAN
    ocr_texts = preprocess_ocr(ocr_texts)
    print(f"[DEBUG] After preprocess: {ocr_texts}")

    # LLM extraction (Mistral)
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

    # Verification logic
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
```

**Why**: Comprehensive logging to trace the entire data flow and identify exactly where verification is failing.

---

## Summary of Changes

| File | Lines | Change | Impact |
|------|-------|--------|--------|
| mistral_extraction.py | 1-4 | Added `import re` | Enables regex-based JSON extraction |
| mistral_extraction.py | 76-99 | Enhanced JSON parsing with fallback | Fixes silent JSON parsing failures |
| verification.py | 25-35 | Added debug logging to `compare_names()` | Traces fuzzy matching |
| verification.py | 39-55 | Enhanced CIN normalization + logging | Handles spaces/hyphens in CIN |
| contracts.py | 99-155 | Added comprehensive debug logging | Full visibility into verification flow |
| contracts.py | 159-166 | Added `status` to response | Clear contract state in API response |

All changes are **minimal and focused** on fixing the verification bug without refactoring or redesigning the system.
