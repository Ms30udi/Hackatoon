"""
HTML to PDF Contract Generator
Generates contracts from HTML templates with better formatting control
"""

import os
import base64
from datetime import datetime
from typing import Dict, Optional


def load_html_template(template_path: str) -> str:
    """Load HTML template from file"""
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()


def fill_html_template(template_html: str, data: Dict[str, any]) -> str:
    """
    Fill HTML template with data by replacing {{placeholders}}
    
    Args:
        template_html: HTML template string
        data: Dictionary with placeholder values
    
    Returns:
        Filled HTML string
    """
    filled_html = template_html
    
    for key, value in data.items():
        placeholder = f"{{{{{key}}}}}"
        filled_html = filled_html.replace(placeholder, str(value))
    
    return filled_html


def embed_signature_in_html(html: str, signature_image_path: str) -> str:
    """
    Embed signature image as base64 in HTML
    
    Args:
        html: HTML string
        signature_image_path: Path to signature image
    
    Returns:
        HTML with embedded signature
    """
    try:
        if os.path.exists(signature_image_path):
            with open(signature_image_path, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
                img_tag = f'<img src="data:image/png;base64,{img_data}" style="max-width: 200px; height: auto;" />'
                html = html.replace('{{signature_image}}', img_tag)
        else:
            html = html.replace('{{signature_image}}', '')
    except Exception as e:
        print(f"Error embedding signature: {e}")
        html = html.replace('{{signature_image}}', '')
    
    return html


def html_to_pdf_xhtml2pdf(html_content: str, output_path: str) -> str:
    """
    Convert HTML to PDF using xhtml2pdf (Windows-compatible, no external deps)
    
    Args:
        html_content: HTML string
        output_path: Output PDF path
    
    Returns:
        Path to generated PDF
    """
    try:
        from xhtml2pdf import pisa
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "wb") as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)
        
        if pisa_status.err:
            print(f"⚠️ PDF generated with {pisa_status.err} errors")
        else:
            print(f"✅ PDF generated with xhtml2pdf: {output_path}")
        
        return output_path
    except ImportError:
        print("❌ xhtml2pdf not installed. Install with: pip install xhtml2pdf")
        return ""
    except Exception as e:
        print(f"❌ Error converting HTML to PDF: {e}")
        import traceback
        traceback.print_exc()
        return ""


def generate_contract_from_html(
    contract_id: int,
    signature_image_path: str,
    customer_data: Dict[str, str],
    contract_data: Dict[str, str],
    customer_type: str = "individual",
    output_dir: str = "uploads/contracts",
    template_name: str = None  # Deprecated, will use JSON templates
) -> str:
    """
    Generate signed contract PDF from JSON template definitions
    
    Args:
        contract_id: Contract ID
        signature_image_path: Path to signature image
        customer_data: Customer information
        contract_data: Contract details
        customer_type: "individual" or "company"
        output_dir: Output directory
        template_name: HTML template filename (Deprecated)
    
    Returns:
        Path to generated PDF
    """
    try:
        # Use dynamic generator instead of static HTML
        from .dynamic_contract_generator import DynamicContractGenerator
        
        generator = DynamicContractGenerator()
        
        # Generator needs to know about full context (customer & contract merged or separate)
        # The generator signature is generate_html(customer_type, customer_data, contract_data, contract_id)
        
        # Ensure output directory exists to avoid errors later
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate HTML from JSON template
        filled_html = generator.generate_html(
            customer_type=customer_type,
            customer_data=customer_data,
            contract_data=contract_data,
            contract_id=contract_id
        )
        
        # Embed signature image
        filled_html = embed_signature_in_html(filled_html, signature_image_path)
        
        # Generate PDF
        output_path = os.path.join(output_dir, f"contract_{contract_id}_signed.pdf")
        
        # Use xhtml2pdf (works on Windows without external dependencies)
        result = html_to_pdf_xhtml2pdf(filled_html, output_path)
        
        return result
        
    except Exception as e:
        print(f"❌ Error generating contract from JSON template: {e}")
        import traceback
        traceback.print_exc()
        return ""
