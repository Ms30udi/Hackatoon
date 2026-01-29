from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

def create_simple_template(filename):
    output_dir = os.path.join(os.path.dirname(__file__), 'closes')
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, filename)
    
    c = canvas.Canvas(file_path, pagesize=A4)
    c.drawString(100, 800, "CONTRACT TEMPLATE (PLACEHOLDER)")
    c.drawString(100, 780, "This is a placeholder for the official contract PDF.")
    c.drawString(100, 760, "The user signature will appear at the bottom of this page.")
    
    # Add some dummy text to make it look like a contract
    text = c.beginText(100, 700)
    text.setFont("Helvetica", 12)
    for i in range(1, 20):
        text.textLine(f"Article {i}: Terms and conditions regarding electricity supply...")
    c.drawText(text)
    
    c.showPage()
    c.save()
    print(f"Created template: {file_path}")

if __name__ == "__main__":
    create_simple_template("Contrat_Abonnement_Electricite.pdf")
    create_simple_template("Contrat_Abonnement_Electricite_Entreprise.pdf")
