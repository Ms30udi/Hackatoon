import os
import json
import re
from mistralai import Mistral


# Initialize client
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

def preprocess_ocr(ocr_texts: list[str]) -> list[str]:
    blacklist = [
        "ROYAUME", "MAROC", "CARTE", "IDENTITÉ",
        "VALABLE", "NE LE", "NÉ LE"
    ]

    cleaned = []
    for line in ocr_texts:
        upper = line.upper()
        if any(word in upper for word in blacklist):
            continue
        cleaned.append(line)

    return cleaned

def extract_identity_with_llm(ocr_texts: list[str]) -> dict:
    """
    Extract French full name and CIN number from OCR text
    using Mistral LLM.
    """

    joined_text = "\n".join(ocr_texts)

    prompt = f"""
You are an expert AI specialized in Moroccan National Identity Cards (CIN).

RULES (VERY IMPORTANT):

1. CIN NUMBER:
- ALWAYS near the BOTTOM of the card
- Format: 1–2 uppercase letters + digits
- Example: EE673532
- If multiple codes exist, choose the one CLOSEST TO THE BOTTOM

2. FULL NAME:
- Extract ONLY the FRENCH (LATIN) name
- IGNORE Arabic text completely
- Usually TWO WORDS, written in CAPITAL LETTERS
- Located near the PERSON'S PHOTO
- Near keywords: "Nom", "Prénom"

3. IGNORE:
- ROYAUME, MAROC, CARTE, IDENTITÉ
- Dates (Né le, date of birth)
- Validity text (Valable jusqu’au)
- Administrative phrases

4. If unsure → return null

OUTPUT:
Return ONLY valid JSON (no explanations).

FORMAT:
{{
  "full_name": string | null,
  "national_id": string | null
}}

OCR TEXT:
\"\"\"
{joined_text}
\"\"\"
"""

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {"role": "system", "content": "Extract identity fields from OCR text."},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=200,
    )

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
