import re

CIN_REGEX = re.compile(r"\b[A-Z]{1,2}\d{5,8}\b")

def extract_cin_rule_based(ocr_lines: list[str]) -> str | None:
    for line in reversed(ocr_lines):
        compact = line.replace(" ", "")
        match = CIN_REGEX.search(compact)
        if match:
            return match.group()
    return None
