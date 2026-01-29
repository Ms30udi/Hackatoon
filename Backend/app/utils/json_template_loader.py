"""
JSON Template Loader
Loads contract templates from contrats_templates.json and provides structured access
"""

import json
import os
from typing import Dict, Optional, List

class ContractTemplateLoader:
    def __init__(self, templates_path: str = None):
        if templates_path is None:
            # Default to documents/contracts/contrats_templates.json relative to this file
            # content root is c:\Users\PC\OneDrive\Bureau\DOCS\Hackatoon
            # this file is in Backend/app/utils
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            templates_path = os.path.join(
                base_dir, 
                '../documents/contracts/contrats_templates.json'
            )
        
        self.templates_path = os.path.abspath(templates_path)
        
        if not os.path.exists(self.templates_path):
             # Fallback to absolute path known from context if relative fails (for safety)
             self.templates_path = r"c:\Users\PC\OneDrive\Bureau\DOCS\Hackatoon\documents\contracts\contrats_templates.json"

        with open(self.templates_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.templates = {t['id']: t for t in self.data.get('templates', [])}
    
    def get_template_by_customer_type(self, customer_type: str, 
                                     tension_level: str = 'BT') -> Optional[Dict]:
        """
        Get template based on customer type and tension level
        
        Args:
            customer_type: 'individual', 'company', 'professionnel', etc.
            tension_level: 'BT' (Basse Tension) or 'MT' (Moyenne Tension)
        
        Returns:
            Template dictionary or None
        """
        # Map customer types to template IDs
        c_type = customer_type.lower()
        if c_type in ['individual', 'particulier', 'residential']:
            return self.templates.get('template_bt_particulier')
        elif c_type in ['company', 'professionnel', 'professional', 'enterprise']:
            if tension_level == 'MT':
                return self.templates.get('template_mt_professionnel')
            else:
                return self.templates.get('template_bt_professionnel')
        elif c_type in ['provisional', 'provisoire']:
            return self.templates.get('template_provisoire')
        
        return None
    
    def get_required_fields(self, template_id: str) -> List[str]:
        """Get required customer fields for a template"""
        template = self.templates.get(template_id)
        if template:
            return template['structure']['parties']['client']['champs_requis']
        return []
    
    def get_sections(self, template_id: str) -> List[Dict]:
        """Get all sections for a template"""
        template = self.templates.get(template_id)
        if template:
            return template['structure']['sections']
        return []
