BLACKLIST_KEYWORDS = [
    "ROYAUME", "MAROC", "CARTE", "NATIONALE", "IDENTITE",
    "VALABLE", "JUSQU", "JUSQU'", "NE LE", "NÉ", "DATE",
    "MARRAKECH", "MC"
]

def clean_ocr_for_name(ocr_lines: list[str]) -> list[str]:
    cleaned = []

    for line in ocr_lines:
        upper = line.upper().strip()

        if len(upper) < 3:
            continue

        if sum(c.isdigit() for c in upper) > 2:
            continue

        if any(bad in upper for bad in BLACKLIST_KEYWORDS):
            continue

        if not upper.isascii():
            continue

        cleaned.append(upper)

    return cleaned
