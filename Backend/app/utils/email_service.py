"""
Email Service for Contract Verification
Handles sending contract PDFs and E-signature instructions to customers
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email import encoders
import os
from typing import List, Optional


class EmailConfig:
    """Email configuration - can be loaded from environment variables"""
    
    # SMTP Server Settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "your-email@gmail.com")
    SENDER_PASSWORD: str = os.getenv("SENDER_PASSWORD", "your-app-password").replace(" ", "")
    
    # Frontend URL for E-signature page
    FRONTEND_BASE_URL: str = os.getenv(
        "FRONTEND_BASE_URL", 
        "http://localhost:5173"
    )
    
    @classmethod
    def configure(cls, smtp_server: str, smtp_port: int, sender_email: str, 
                  sender_password: str, frontend_url: str):
        """Configure email settings programmatically"""
        cls.SMTP_SERVER = smtp_server
        cls.SMTP_PORT = smtp_port
        cls.SENDER_EMAIL = sender_email
        cls.SENDER_PASSWORD = sender_password
        cls.FRONTEND_BASE_URL = frontend_url


def send_verification_email(
    recipient_email: str,
    customer_name: str,
    contract_id: int,
    pdf_paths: List[str],
    subject: str = "Complete Your Energy Supply Contract - E-Signature Required"
) -> bool:
    """
    Send verification email with contract PDFs and E-signature instructions.
    
    Args:
        recipient_email: Customer's email address
        customer_name: Customer's full name
        contract_id: ID of the contract
        pdf_paths: List of PDF file paths to attach
        subject: Email subject line
    
    Returns:
        True if email sent successfully, False otherwise
    """
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = EmailConfig.SENDER_EMAIL
        message["To"] = recipient_email
        
        # Generate E-signature page URL
        esignature_url = f"{EmailConfig.FRONTEND_BASE_URL}/contract/{contract_id}/sign"
        
        # ====== HTML EMAIL BODY ======
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }}
                    .header {{
                        background-color: #1a4d2e;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                    }}
                    .content {{
                        background-color: white;
                        padding: 30px 20px;
                        border-left: 1px solid #ddd;
                        border-right: 1px solid #ddd;
                    }}
                    .greeting {{
                        font-size: 16px;
                        margin-bottom: 20px;
                    }}
                    .section {{
                        margin: 20px 0;
                        padding: 15px;
                        background-color: #f5f5f5;
                        border-left: 4px solid #1a4d2e;
                    }}
                    .section h2 {{
                        margin-top: 0;
                        color: #1a4d2e;
                        font-size: 18px;
                    }}
                    .section p {{
                        margin: 8px 0;
                    }}
                    .instructions {{
                        background-color: #e8f5e9;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }}
                    .step {{
                        margin: 15px 0;
                        padding-left: 30px;
                    }}
                    .step-number {{
                        display: inline-block;
                        background-color: #1a4d2e;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        text-align: center;
                        line-height: 24px;
                        margin-left: -30px;
                        margin-right: 10px;
                        font-weight: bold;
                    }}
                    .cta-button {{
                        display: inline-block;
                        background-color: #2d6a4f;
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        margin: 20px 0;
                        text-align: center;
                    }}
                    .cta-button:hover {{
                        background-color: #1a4d2e;
                    }}
                    .footer {{
                        background-color: #f5f5f5;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #ddd;
                    }}
                    .important {{
                        color: #d32f2f;
                        font-weight: bold;
                    }}
                    .button-container {{
                        text-align: center;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Complete Your Contract</h1>
                        <p>Energy Supply Agreement - E-Signature Required</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            <p>Dear <strong>{customer_name}</strong>,</p>
                            <p>Thank you for submitting your energy supply contract application. We have verified your identity and are now ready for the final step: <span class="important">Digital Signature</span>.</p>
                        </div>
                        
                        <div class="section">
                            <h2>📄 Contract Documents</h2>
                            <p>We have attached an important document for your review:</p>
                            <ul>
                                <li><strong>Guide_Explicatif_Clauses.pdf</strong> - Contract Terms, Clauses and Agreement Details</li>
                            </ul>
                            <p><em>Please download and review this document carefully before proceeding to e-signature.</em></p>
                        </div>
                        
                        <div class="instructions">
                            <h3>✅ How to Complete Your E-Signature:</h3>
                            
                            <div class="step">
                                <span class="step-number">1</span>
                                <strong>Review Documents</strong><br>
                                Download and read both PDF files attached to this email carefully.
                            </div>
                            
                            <div class="step">
                                <span class="step-number">2</span>
                                <strong>Click the Button Below</strong><br>
                                Click "Sign My Contract" button to proceed to the digital signature page.
                            </div>
                            
                            <div class="step">
                                <span class="step-number">3</span>
                                <strong>Draw Your Signature</strong><br>
                                Use your mouse or touchpad to draw your signature in the designated area.
                            </div>
                            
                            <div class="step">
                                <span class="step-number">4</span>
                                <strong>Submit and Confirm</strong><br>
                                Click "Confirm Signature" to finalize and send your contract.
                            </div>
                        </div>
                        
                        <div class="button-container">
                            <a href="{esignature_url}" class="cta-button">
                                🖊️ Sign My Contract Now
                            </a>
                        </div>
                        
                        <div class="section">
                            <h2>⏱️ Important Information</h2>
                            <ul>
                                <li>Your e-signature page will be valid for <strong>30 days</strong> from this email date.</li>
                                <li>Once signed, your contract will be finalized and activated.</li>
                                <li>A copy of your signed contract will be sent to this email address.</li>
                                <li>If you need assistance, please contact our support team.</li>
                            </ul>
                        </div>
                        
                        <div class="section">
                            <h2>🔒 Security & Privacy</h2>
                            <p>Your digital signature is legally binding and secured according to international standards. 
                            Your personal information is encrypted and protected throughout the process.</p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>Contract ID: {contract_id}</p>
                        <p>&copy; 2026 Energy Supply Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Attach HTML body
        part = MIMEText(html_body, "html")
        message.attach(part)
        
        # ====== ATTACH PDFs ======
        for pdf_path in pdf_paths:
            if os.path.exists(pdf_path):
                try:
                    with open(pdf_path, "rb") as attachment:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(attachment.read())
                    
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename= {os.path.basename(pdf_path)}"
                    )
                    message.attach(part)
                    print(f"✅ Attached: {os.path.basename(pdf_path)}")
                except Exception as e:
                    print(f"⚠️  Failed to attach {pdf_path}: {e}")
            else:
                print(f"⚠️  PDF not found: {pdf_path}")
        
        # ====== SEND EMAIL ======
        server = smtplib.SMTP(EmailConfig.SMTP_SERVER, EmailConfig.SMTP_PORT)
        server.starttls()
        server.login(EmailConfig.SENDER_EMAIL, EmailConfig.SENDER_PASSWORD)
        server.send_message(message)
        server.quit()
        
        print(f"✅ Email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False


def send_signed_contract_email(
    recipient_email: str,
    customer_name: str,
    contract_id: int,
    signed_pdf_path: str,
    subject: str = "Your Signed Energy Supply Contract"
) -> bool:
    """
    Send the final signed contract PDF to customer.
    
    Args:
        recipient_email: Customer's email address
        customer_name: Customer's full name
        contract_id: ID of the contract
        signed_pdf_path: Path to the final signed PDF
        subject: Email subject line
    
    Returns:
        True if email sent successfully, False otherwise
    """
    
    try:
        message = MIMEMultipart()
        message["Subject"] = subject
        message["From"] = EmailConfig.SENDER_EMAIL
        message["To"] = recipient_email
        
        # ====== EMAIL BODY ======
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }}
                    .header {{
                        background-color: #1a4d2e;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: white;
                        padding: 30px 20px;
                        border-left: 1px solid #ddd;
                        border-right: 1px solid #ddd;
                    }}
                    .success-message {{
                        background-color: #e8f5e9;
                        border-left: 4px solid #4caf50;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 5px;
                    }}
                    .footer {{
                        background-color: #f5f5f5;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #ddd;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Contract Successfully Signed</h1>
                    </div>
                    
                    <div class="content">
                        <p>Dear <strong>{customer_name}</strong>,</p>
                        
                        <div class="success-message">
                            <h2 style="margin-top: 0; color: #4caf50;">🎉 Congratulations!</h2>
                            <p>Your energy supply contract has been successfully signed and is now <strong>ACTIVE</strong>.</p>
                        </div>
                        
                        <h3>📋 What's Next?</h3>
                        <ul>
                            <li>Your service activation will commence within 2-3 business days.</li>
                            <li>You will receive a confirmation email with your service details.</li>
                            <li>Your meter installation date will be scheduled shortly.</li>
                            <li>Keep the signed contract attached to this email for your records.</li>
                        </ul>
                        
                        <h3>📞 Need Help?</h3>
                        <p>If you have any questions about your contract or service, please contact our customer support team:</p>
                        <ul>
                            <li>Email: support@energycompany.com</li>
                            <li>Phone: +216 XX XXX XXXX</li>
                            <li>Available Monday-Friday, 9AM-6PM</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <p>Contract ID: {contract_id}</p>
                        <p>&copy; 2026 Energy Supply Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        part = MIMEText(html_body, "html")
        message.attach(part)
        
        # ====== ATTACH SIGNED PDF ======
        if os.path.exists(signed_pdf_path):
            try:
                with open(signed_pdf_path, "rb") as attachment:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment.read())
                
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename=contract_{contract_id}_signed.pdf"
                )
                message.attach(part)
                print(f"✅ Attached signed contract: {os.path.basename(signed_pdf_path)}")
            except Exception as e:
                print(f"⚠️  Failed to attach signed contract: {e}")
        else:
            print(f"⚠️  Signed PDF not found: {signed_pdf_path}")
        
        # ====== SEND EMAIL ======
        server = smtplib.SMTP(EmailConfig.SMTP_SERVER, EmailConfig.SMTP_PORT)
        server.starttls()
        server.login(EmailConfig.SENDER_EMAIL, EmailConfig.SENDER_PASSWORD)
        server.send_message(message)
        server.quit()
        
        print(f"✅ Signed contract email sent to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending signed contract email: {e}")
        return False
