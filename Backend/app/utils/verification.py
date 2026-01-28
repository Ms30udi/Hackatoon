import unicodedata
import re
from difflib import SequenceMatcher


def normalize_name(name: str) -> str:
    """
    Normalize names for comparison:
    - uppercase
    - remove accents
    - remove extra spaces
    """
    if not name:
        return ""

    name = name.upper().strip()
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    name = re.sub(r"\s+", " ", name)

    return name


def compare_names(db_name: str, extracted_name: str) -> float:
    """
    Returns similarity score between 0 and 1
    """
    if not db_name or not extracted_name:
        print(f"[DEBUG verify] compare_names: db_name={db_name}, extracted_name={extracted_name} → returning 0.0")
        return 0.0

    db_norm = normalize_name(db_name)
    ext_norm = normalize_name(extracted_name)

    score = SequenceMatcher(None, db_norm, ext_norm).ratio()
    print(f"[DEBUG verify] compare_names: '{db_name}' → '{db_norm}' vs '{extracted_name}' → '{ext_norm}' = {score}")
    return score


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
