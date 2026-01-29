"""
PDF Generator for Contracts
Handles creation of contract PDFs with customer info, clauses, and optional signatures
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, 
    Image, PageBreak
)
from reportlab.lib import colors
from datetime import datetime
import os
import json

# Import HTML-based generator for better formatting
from .html_pdf_generator import generate_contract_from_html


def generate_contract_pdf(
    output_path: str,
    customer_name: str,
    customer_id: str,
    customer_email: str,
    customer_address: str,
    customer_phone: str,
    contract_address: str,
    provider: str,
    customer_type: str,
    subscribed_power: float,
    applied_tariff: str,
    signature_image_path: str = None,
    include_signature: bool = False
) -> str:
    """
    Generate a professional contract PDF with customer information and clauses.
    
    Args:
        output_path: Full path where PDF should be saved
        customer_name: Customer's full name
        customer_id: Customer's national ID
        customer_email: Customer's email
        customer_address: Customer's residential address
        customer_phone: Customer's phone number
        contract_address: Address where contract applies
        provider: Energy provider name
        customer_type: "individual" or "company"
        subscribed_power: Subscribed power in kW
        applied_tariff: Tariff name/code
        signature_image_path: Path to signature image (if signed)
        include_signature: Whether to include signature in PDF
    
    Returns:
        Full path to created PDF
    """
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Container for PDF elements
    elements = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a4d2e'),
        spaceAfter=12,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#2d6a4f'),
        spaceAfter=8,
        spaceBefore=10
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        alignment=4  # Justify
    )
    
    # ====== HEADER SECTION ======
    title = Paragraph(
        "ENERGY SUPPLY CONTRACT",
        title_style
    )
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))
    
    # Contract generation date
    date_para = Paragraph(
        f"<b>Contract Date:</b> {datetime.now().strftime('%d/%m/%Y')}",
        normal_style
    )
    elements.append(date_para)
    elements.append(Spacer(1, 0.2*inch))
    
    # ====== CUSTOMER INFORMATION SECTION ======
    elements.append(Paragraph("CUSTOMER INFORMATION", heading_style))
    
    customer_data = [
        ['Full Name:', customer_name],
        ['National ID:', customer_id],
        ['Email:', customer_email],
        ['Phone:', customer_phone],
        ['Residential Address:', customer_address],
    ]
    
    customer_table = Table(customer_data, colWidths=[2*inch, 4*inch])
    customer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f5e9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(customer_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # ====== CONTRACT DETAILS SECTION ======
    elements.append(Paragraph("CONTRACT DETAILS", heading_style))
    
    contract_data = [
        ['Provider:', provider],
        ['Customer Type:', customer_type.capitalize()],
        ['Contract Address:', contract_address],
        ['Subscribed Power:', f"{subscribed_power} kW"],
        ['Applied Tariff:', applied_tariff],
    ]
    
    contract_table = Table(contract_data, colWidths=[2*inch, 4*inch])
    contract_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e3f2fd')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(contract_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # ====== CLAUSES SECTION ======
    elements.append(Paragraph("STANDARD CLAUSES", heading_style))
    
    clauses = [
        ("1. PAYMENT TERMS", 
         "The customer agrees to pay the invoiced amount within 30 days from the invoice date. "
         "Late payment may result in service interruption."),
        
        ("2. SERVICE QUALITY", 
         "The provider commits to maintain electricity supply according to national regulations. "
         "The provider shall not be liable for force majeure events beyond its control."),
        
        ("3. METER READING", 
         "The meter will be read regularly according to the schedule provided. "
         "The customer is responsible for providing safe access to the meter."),
        
        ("4. TERMINATION", 
         "This contract can be terminated by either party with 30 days written notice. "
         "Any outstanding balances must be settled before disconnection."),
        
        ("5. CONFIDENTIALITY", 
         "Both parties agree to maintain confidentiality of sensitive information "
         "shared during the course of this contract."),
    ]
    
    for clause_title, clause_text in clauses:
        elements.append(Paragraph(clause_title, ParagraphStyle(
            'ClauseTitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#1a4d2e'),
            fontName='Helvetica-Bold',
            spaceAfter=4
        )))
        elements.append(Paragraph(clause_text, normal_style))
        elements.append(Spacer(1, 0.15*inch))
    
    # ====== SIGNATURE SECTION ======
    elements.append(Spacer(1, 0.3*inch))
    
    if include_signature and signature_image_path and os.path.exists(signature_image_path):
        elements.append(Paragraph("DIGITAL SIGNATURE", heading_style))
        
        try:
            sig_image = Image(
                signature_image_path,
                width=2*inch,
                height=0.75*inch
            )
            elements.append(sig_image)
            elements.append(Spacer(1, 0.1*inch))
        except Exception as e:
            print(f"Warning: Could not insert signature image: {e}")
        
        signed_date = Paragraph(
            f"<b>Signed on:</b> {datetime.now().strftime('%d/%m/%Y at %H:%M')}",
            normal_style
        )
        elements.append(signed_date)
    else:
        # Signature placeholder for unsigned contracts
        elements.append(Paragraph("SIGNATURE (to be completed)", heading_style))
        sig_table = Table([['Customer Signature: _____________________']], colWidths=[6*inch])
        elements.append(sig_table)
    
    # ====== BUILD PDF ======
    doc.build(elements)
    
    return output_path


def generate_verification_email_pdfs(
    contract_id: int,
    customer_name: str,
    customer_id: str,
    customer_email: str,
    customer_address: str,
    customer_phone: str,
    contract_address: str,
    provider: str,
    customer_type: str,
    subscribed_power: float,
    applied_tariff: str,
    output_dir: str = "uploads/contracts"
) -> list:
    """
    Generate 2 PDFs for email verification: one for terms & conditions, one for clauses.
    
    Args:
        All standard contract parameters
        output_dir: Directory where PDFs will be saved
    
    Returns:
        List of 2 PDF file paths
    """
    
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_paths = []
    
    # PDF 1: Terms and Conditions
    pdf1_path = os.path.join(
        output_dir,
        f"contract_{contract_id}_terms.pdf"
    )
    
    generate_contract_pdf(
        output_path=pdf1_path,
        customer_name=customer_name,
        customer_id=customer_id,
        customer_email=customer_email,
        customer_address=customer_address,
        customer_phone=customer_phone,
        contract_address=contract_address,
        provider=provider,
        customer_type=customer_type,
        subscribed_power=subscribed_power,
        applied_tariff=applied_tariff,
        include_signature=False
    )
    pdf_paths.append(pdf1_path)
    
    # PDF 2: Service Clauses (similar content for now)
    pdf2_path = os.path.join(
        output_dir,
        f"contract_{contract_id}_clauses.pdf"
    )
    
    generate_contract_pdf(
        output_path=pdf2_path,
        customer_name=customer_name,
        customer_id=customer_id,
        customer_email=customer_email,
        customer_address=customer_address,
        customer_phone=customer_phone,
        contract_address=contract_address,
        provider=provider,
        customer_type=customer_type,
        subscribed_power=subscribed_power,
        applied_tariff=applied_tariff,
        include_signature=False
    )
    pdf_paths.append(pdf2_path)
    
    return pdf_paths


def generate_signed_contract_pdf(
    contract_id: int,
    signature_image_path: str,
    customer_name: str,
    customer_type: str,
    output_dir: str = "uploads/contracts",
    contract_data: dict = None
) -> str:
    """
    Generate the final signed contract using HTML template.
    
    Args:
        contract_id: Contract ID
        signature_image_path: Path to signature image
        customer_name: Customer Name
        customer_type: "individual" or "company"
        output_dir: Directory to save signed PDF
        contract_data: Dictionary containing additional data (cni, address, power, etc.)
    
    Returns:
        Path to signed PDF
    """
    try:
        # Use HTML-based generator
        customer_info = contract_data or {}
        customer_info['full_name'] = customer_name
        
        contract_info = {
            'contract_address': customer_info.get('contract_address', ''),
            'subscribed_power': customer_info.get('subscribed_power', '')
        }
        
        return generate_contract_from_html(
            contract_id=contract_id,
            signature_image_path=signature_image_path,
            customer_data=customer_info,
            contract_data=contract_info,
            customer_type=customer_type,
            output_dir=output_dir
        )
        
    except Exception as e:
        print(f"Error generating signed PDF: {e}")
        import traceback
        traceback.print_exc()
        return ""
