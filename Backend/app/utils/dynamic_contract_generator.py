"""
Dynamic Contract Generator
Generates HTML contracts from JSON template definitions
"""

from typing import Dict
from .json_template_loader import ContractTemplateLoader
from datetime import datetime

class DynamicContractGenerator:
    def __init__(self):
        self.loader = ContractTemplateLoader()
    
    def generate_html(self, 
                     customer_type: str,
                     customer_data: Dict,
                     contract_data: Dict,
                     contract_id: int) -> str:
        """
        Generate HTML contract from JSON template
        
        Args:
            customer_type: Type of customer
            customer_data: Customer information
            contract_data: Contract details
            contract_id: Contract ID
        
        Returns:
            HTML string
        """
        # Determine tension level (default to BT if not specified)
        tension_level = contract_data.get('tension_level', 'BT')
        
        # Load appropriate template
        template = self.loader.get_template_by_customer_type(customer_type, tension_level)
        
        if not template:
            # Fallback to individual if specific type not found, or raise error
            # For now, let's try individual as fallback or raise
            template = self.loader.get_template_by_customer_type('individual')
            if not template:
                raise ValueError(f"No contract template found for customer type: {customer_type}")
        
        # Build HTML
        html = self._build_html_structure(template, customer_data, contract_data, contract_id)
        
        return html
    
    def _build_html_structure(self, template: Dict, customer_data: Dict, 
                             contract_data: Dict, contract_id: int) -> str:
        """Build complete HTML document from template"""
        
        sections_html = ""
        for section in template['structure']['sections']:
            sections_html += self._build_section(section, customer_data, contract_data)
        
        # Use base HTML structure with dynamic content
        html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>{template['titre']}</title>
  {self._get_styles()}
</head>
<body>
  <h1>ROYAUME DU MAROC</h1>
  <h2>{template['titre']}</h2>
  
  <div class="section">
    <p><span class="label">Numéro de contrat :</span> REF-{contract_id:06d}</p>
    <p><span class="label">Date d'établissement :</span> {datetime.now().strftime('%d/%m/%Y')}</p>
    <p><span class="label">Type de contrat :</span> {template['type_client']}</p>
  </div>
  
  <h2>PARTIES AU CONTRAT</h2>
  {self._build_parties_section(template, customer_data)}
  
  {sections_html}
  
  {self._build_signature_section(customer_data)}
</body>
</html>
"""
        return html
    
    def _build_parties_section(self, template: Dict, customer_data: Dict) -> str:
        """Build the parties section (Fournisseur + Client)"""
        fournisseur = template['structure']['parties']['fournisseur']
        
        # Handle simple string or dict for 'denomination' check
        # The json has 'denomination', 'branche' directly under 'fournisseur'
        f_name = fournisseur.get('denomination', 'ONEE')
        f_branch = fournisseur.get('branche', '')
        
        html = f"""
  <div class="section">
    <h3>Le Fournisseur</h3>
    <p>{f_name} – {f_branch}</p>
  </div>
  
  <div class="section">
    <h3>Le Client</h3>
"""
        
        # Add customer fields based on template requirements
        required_fields = template['structure']['parties']['client']['champs_requis']
        
        for field in required_fields:
            value = self._get_customer_field_value(field, customer_data)
            # Only show if value is present to avoid empty fields being ugly, 
            # though they are 'requis' (required).
            html += f"    <p><span class='label'>{field} :</span> {value}</p>\n"
        
        html += "  </div>\n"
        
        return html
    
    def _build_section(self, section: Dict, customer_data: Dict, 
                      contract_data: Dict) -> str:
        """Build a single contract section"""
        
        html = f"""
  <h2>ARTICLE {section['numero']} – {section['titre']}</h2>
  <p>{section['contenu']}</p>
"""
        
        # Handle variable fields
        if section.get('type') == 'variable' and section.get('champ_variable'):
            var_name = section['champ_variable']
            # Try to find value in contract_data, handle mappings if needed
            value = contract_data.get(var_name, '')
            # If not found in contract_data directly, check if we need to map it
            if not value and var_name == 'puissance_souscrite':
                 value = str(contract_data.get('subscribed_power', '')) + ' kVA'
            
            html += f"  <p><span class='label'>{var_name.replace('_', ' ').title()} :</span> {value}</p>\n"
        
        return html
    
    def _get_customer_field_value(self, field_name: str, customer_data: Dict) -> str:
        """Map field names (from JSON) to customer data (from DB/Schema)"""
        # Normalize field name for easier matching if needed
        
        # Simple mapping
        field_mapping = {
            'Nom et prenom': customer_data.get('full_name', ''),
            'Numero CNI': customer_data.get('national_id', ''),
            'Adresse complete du local': customer_data.get('address', ''),
            'Numero de telephone': customer_data.get('phone', ''),
            'Email': customer_data.get('email', ''),
            'Raison sociale ou Nom commercial': customer_data.get('company_name', ''),
            'Forme juridique': customer_data.get('legal_form', ''),
            'Registre de commerce': customer_data.get('trade_register', ''),
            'ICE': customer_data.get('ice_number', ''),
            'ICE (Identifiant Commun de l\'Entreprise)': customer_data.get('ice_number', ''),
            'Adresse du siege social': customer_data.get('address', ''), # Assuming address is used for siege social for now
            'Adresse du local a alimenter': customer_data.get('contract_address', customer_data.get('address', '')),
            'Nom du representant legal': customer_data.get('legal_representative_name', ''),
            'CIN du representant legal': customer_data.get('legal_representative_cin', ''),
            'Email professionnel': customer_data.get('email', ''),
            'Telephone': customer_data.get('phone', ''),
            'Responsable technique': customer_data.get('technical_contact', ''), # Potential future field
            'Contact facturation': customer_data.get('billing_contact', ''),     # Potential future field
        }
        
        return str(field_mapping.get(field_name, ''))
    
    def _get_styles(self) -> str:
        """Return CSS styles for the contract"""
        return """
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.4;
      margin: 30px;
      color: #222;
      font-size: 11px;
    }
    h1, h2, h3 { text-align: center; }
    h1 { font-size: 16px; margin: 10px 0; }
    h2 { font-size: 14px; margin-top: 20px; border-bottom: 2px solid #000; padding-bottom: 5px; }
    h3 { font-size: 12px; margin: 10px 0; }
    .section { margin-bottom: 15px; }
    .label { font-weight: bold; }
    p { margin: 5px 0; }
    .signature { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 45%; }
    .signature-image img { max-width: 150px; height: auto; border: 1px solid #ccc; padding: 5px; }
  </style>
"""
    
    def _build_signature_section(self, customer_data: Dict) -> str:
        """Build signature section"""
        return """
  <div class="signature">
    <div class="signature-box">
      <p><strong>LE FOURNISSEUR</strong></p>
      <p style="font-size: 10px;">Signature et cachet</p>
      <div style="height: 60px;"></div>
    </div>
    <div class="signature-box">
      <p><strong>LE CLIENT</strong></p>
      <p style="font-size: 10px;">« Lu et approuvé »</p>
      <div class="signature-image">{{signature_image}}</div>
    </div>
  </div>
"""
