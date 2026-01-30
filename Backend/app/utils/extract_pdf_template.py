# Extract PDF structure to JSON template
# This script analyzes a PDF and creates a JSON template for field mapping

import json
import os
from pypdf import PdfReader

def extract_pdf_to_json(pdf_path: str, output_json_path: str):
    # extract structure and save to json
    
    reader = PdfReader(pdf_path)
    
    template = {
        "template_name": "Contrat_Abonnement_Electricite",
        "template_file": os.path.basename(pdf_path),
        "num_pages": len(reader.pages),
        "page_size": {
            "width": float(reader.pages[0].mediabox.width),
            "height": float(reader.pages[0].mediabox.height)
        },
        "fields": {
            "page_1": {
                "contract_reference": {"x": 200, "y": 715, "font": "Helvetica-Bold", "size": 10},
                "contract_date": {"x": 200, "y": 690, "font": "Helvetica-Bold", "size": 10},
                "provider_city": {"x": 310, "y": 565, "font": "Helvetica-Bold", "size": 10},
                "customer_name": {"x": 200, "y": 445, "font": "Helvetica-Bold", "size": 10},
                "customer_cni": {"x": 200, "y": 420, "font": "Helvetica-Bold", "size": 10},
                "customer_dob": {"x": 200, "y": 395, "font": "Helvetica-Bold", "size": 10},
                "customer_address": {"x": 200, "y": 370, "font": "Helvetica-Bold", "size": 10},
                "customer_phone": {"x": 200, "y": 345, "font": "Helvetica-Bold", "size": 10},
                "customer_email": {"x": 200, "y": 320, "font": "Helvetica-Bold", "size": 10}
            },
            "page_3": {
                "supply_address": {"x": 200, "y": 680, "font": "Helvetica-Bold", "size": 10},
                "supply_city": {"x": 200, "y": 655, "font": "Helvetica-Bold", "size": 10},
                "supply_province": {"x": 200, "y": 630, "font": "Helvetica-Bold", "size": 10},
                "supply_zip": {"x": 200, "y": 605, "font": "Helvetica-Bold", "size": 10},
                "subscribed_power": {"x": 200, "y": 497, "font": "Helvetica-Bold", "size": 10},
                "meter_type": {"x": 200, "y": 472, "font": "Helvetica-Bold", "size": 10},
                "meter_number": {"x": 200, "y": 422, "font": "Helvetica-Bold", "size": 10}
            },
            "page_11": {
                "fee_caution": {"x": 450, "y": 625, "font": "Helvetica-Bold", "size": 10},
                "fee_frais": {"x": 450, "y": 595, "font": "Helvetica-Bold", "size": 10},
                "fee_total": {"x": 450, "y": 565, "font": "Helvetica-Bold", "size": 10},
                "signature_city": {"x": 150, "y": 235, "font": "Helvetica-Bold", "size": 10},
                "signature_date": {"x": 350, "y": 235, "font": "Helvetica-Bold", "size": 10},
                "signature_image": {"x": 350, "y": 150, "width": 100, "height": 50},
                "signature_text": {"x": 360, "y": 140, "font": "Helvetica", "size": 8, "text": "Lu et approuvé (Signed)"}
            }
        },
        "data_mapping": {
            "contract_reference": "REF-{contract_id:06d}",
            "contract_date": "{current_date}",
            "provider_city": "Marrakech",
            "customer_name": "{customer.full_name}",
            "customer_cni": "{customer.national_id}",
            "customer_dob": "{customer.dob}",
            "customer_address": "{customer.address}",
            "customer_phone": "{customer.phone}",
            "customer_email": "{customer.email}",
            "supply_address": "{contract.contract_address}",
            "supply_city": "Marrakech",
            "supply_province": "Marrakech",
            "supply_zip": "40000",
            "subscribed_power": "{contract.subscribed_power}",
            "meter_type": "Bi-Horaire",
            "meter_number": "M-{contract_id:06d}",
            "fee_caution": "500.00",
            "fee_frais": "200.00",
            "fee_total": "819.23",
            "signature_city": "Marrakech",
            "signature_date": "{current_date}",
            "signature_image": "{signature_path}"
        }
    }
    
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)
    
    print(f"Template extracted to: {output_json_path}")
    print(f"Total pages: {template['num_pages']}")
    print(f"Fields defines: {sum(len(fields) for fields in template['fields'].values())}")

if __name__ == "__main__":
    pdf_path = os.path.join(os.path.dirname(__file__), 'closes', 'Contrat_Abonnement_Electricite1.pdf')
    output_json = os.path.join(os.path.dirname(__file__), 'closes', 'contract_template.json')
    
    extract_pdf_to_json(pdf_path, output_json)
