# JSON-based PDF Generator
# Generates PDFs using a JSON template configuration

import json
import os
from datetime import datetime
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import io


def load_template(template_path: str) -> dict:
    """Load JSON template configuration"""
    with open(template_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def resolve_field_value(mapping: str, data: dict) -> str:
    """
    Resolve a field mapping string with actual data.
    
    Args:
        mapping: String like "{customer.full_name}" or "REF-{contract_id:06d}"
        data: Dictionary containing the actual values
    
    Returns:
        Resolved string value
    """
    try:
        # Handle simple placeholders
        result = mapping
        
        # Replace {current_date}
        if '{current_date}' in result:
            result = result.replace('{current_date}', datetime.now().strftime('%d/%m/%Y'))
        
        # Replace {contract_id:06d} format
        if '{contract_id:06d}' in result and 'contract_id' in data:
            result = result.replace('{contract_id:06d}', f"{data['contract_id']:06d}")
        
        # Replace {customer.field} format
        for key in ['full_name', 'national_id', 'dob', 'address', 'phone', 'email']:
            placeholder = f"{{customer.{key}}}"
            if placeholder in result and 'customer' in data:
                value = data['customer'].get(key, '')
                result = result.replace(placeholder, str(value))
        
        # Replace {contract.field} format
        for key in ['contract_address', 'subscribed_power']:
            placeholder = f"{{contract.{key}}}"
            if placeholder in result and 'contract' in data:
                value = data['contract'].get(key, '')
                result = result.replace(placeholder, str(value))
        
        # Replace {signature_path}
        if '{signature_path}' in result and 'signature_path' in data:
            result = data['signature_path']
        
        return result
    except Exception as e:
        print(f"Error resolving field: {mapping}, error: {e}")
        return ""


def generate_pdf_from_template(
    template_json_path: str,
    template_pdf_path: str,
    output_pdf_path: str,
    data: dict
) -> str:
    """
    Generate a filled PDF using JSON template configuration.
    
    Args:
        template_json_path: Path to JSON template configuration
        template_pdf_path: Path to base PDF template
        output_pdf_path: Path where filled PDF will be saved
        data: Dictionary containing all the data to fill
            {
                'contract_id': int,
                'customer': {'full_name': str, 'national_id': str, ...},
                'contract': {'contract_address': str, ...},
                'signature_path': str
            }
    
    Returns:
        Path to generated PDF
    """
    try:
        # Load template configuration
        template = load_template(template_json_path)
        
        # Create overlay PDF with data
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=A4)
        
        # Track which page we're on
        current_page = 0
        
        # Process each page's fields
        for page_key in sorted(template['fields'].keys()):
            page_num = int(page_key.split('_')[1]) - 1  # Convert "page_1" to 0
            
            # Add blank pages until we reach the target page
            while current_page < page_num:
                can.showPage()
                current_page += 1
            
            # Draw fields for this page
            for field_name, field_config in template['fields'][page_key].items():
                # Get the data mapping for this field
                mapping = template['data_mapping'].get(field_name, '')
                
                # Check if it's an image (signature)
                if field_name == 'signature_image':
                    signature_path = data.get('signature_path', '')
                    if signature_path and os.path.exists(signature_path):
                        try:
                            can.drawImage(
                                signature_path,
                                field_config['x'],
                                field_config['y'],
                                width=field_config['width'],
                                height=field_config['height'],
                                mask='auto'
                            )
                        except Exception as e:
                            print(f"Error drawing signature: {e}")
                
                # Check if it's static text with position
                elif 'text' in field_config:
                    can.setFont(field_config.get('font', 'Helvetica'), field_config.get('size', 10))
                    can.drawString(field_config['x'], field_config['y'], field_config['text'])
                
                # it's a dynamic field
                else:
                    value = resolve_field_value(mapping, data)
                    if value:
                        can.setFont(field_config.get('font', 'Helvetica'), field_config.get('size', 10))
                        can.drawString(field_config['x'], field_config['y'], str(value))
            
            can.showPage()
            current_page += 1
        
        can.save()
        
        # Merge overlay with template PDF
        packet.seek(0)
        overlay_pdf = PdfReader(packet)
        template_pdf = PdfReader(open(template_pdf_path, "rb"))
        output = PdfWriter()
        
        # Merge pages
        for i in range(len(template_pdf.pages)):
            page = template_pdf.pages[i]
            
            # If we have an overlay page, merge it
            if i < len(overlay_pdf.pages):
                page.merge_page(overlay_pdf.pages[i])
            
            output.add_page(page)
        
        # Save output
        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
        with open(output_pdf_path, "wb") as output_file:
            output.write(output_file)
        
        print(f"PDF generated: {output_pdf_path}")
        return output_pdf_path
    
    except Exception as e:
        print(f"Error generating PDF from template: {e}")
        return ""


# Convenience function for contract signing
def generate_signed_contract_from_template(
    contract_id: int,
    signature_image_path: str,
    customer_data: dict,
    contract_data: dict,
    customer_type: str = "individual",
    output_dir: str = "uploads/contracts"
) -> str:
    """
    Generate signed contract using JSON template.
    
    Args:
        contract_id: Contract ID
        signature_image_path: Path to signature image
        customer_data: Customer information dict
        contract_data: Contract information dict
        customer_type: "individual" or "company"
        output_dir: Output directory
    
    Returns:
        Path to generated PDF
    """
    # Determine template paths
    closes_dir = os.path.join(os.path.dirname(__file__), 'closes')
    template_json = os.path.join(closes_dir, 'contract_template.json')
    
    if customer_type.lower() == 'company':
        template_pdf = os.path.join(closes_dir, 'Contrat_Abonnement_Electricite_Entreprise.pdf')
    else:
        template_pdf = os.path.join(closes_dir, 'Contrat_Abonnement_Electricite.pdf')
    
    output_pdf = os.path.join(output_dir, f"contract_{contract_id}_signed.pdf")
    
    # Prepare data
    data = {
        'contract_id': contract_id,
        'customer': customer_data,
        'contract': contract_data,
        'signature_path': signature_image_path
    }
    
    return generate_pdf_from_template(template_json, template_pdf, output_pdf, data)
