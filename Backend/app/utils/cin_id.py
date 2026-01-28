import re

CIN_REGEX = re.compile(r"\b[A-Z]{1,2}\d{5,8}\b")

def extract_cin_from_text(ocr_texts: list[str]) -> str | None:
    # CIN usually at bottom → reverse scan
    for line in reversed(ocr_texts):
        match = CIN_REGEX.search(line.replace(" ", ""))
        if match:
            return match.group(0)
    return None
