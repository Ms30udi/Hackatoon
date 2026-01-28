/**
 * Knowledge Base Data Service
 *
 * Centralized access to all JSON data from the documents folder.
 * Provides typed helper functions for accessing complaint categories,
 * required documents, procedures, power options, and payment methods.
 *
 * @module lib/knowledgeBase
 */

// Import JSON data
import reclamationsData from '../../../documents/reclamations.json';
import documentsRequisData from '../../../documents/documents_requis.json';
import proceduresData from '../../../documents/procedures.json';
import typesCompteursData from '../../../documents/types_compteurs.json';
import modesPaiementData from '../../../documents/modes_paiement.json';

// ============================================================================
// TYPES
// ============================================================================

export interface ComplaintType {
  id: string;
  type: string;
  description: string;
  informations_requises: string[];
  delai_traitement: string;
  resolution_possible: string[];
}

export interface ComplaintCategory {
  id: string;
  categorie: string;
  description: string;
  types: ComplaintType[];
}

export interface ConsumerRight {
  droit: string;
  description: string;
}

export interface RequiredDocument {
  id: string;
  nom: string;
  description: string;
  alternatives?: string[];
  requis_si?: string;
  format_accepte?: string[];
  validite?: string;
  exemples?: string[];
}

export interface DocumentsForService {
  id: string;
  service: string;
  documents_obligatoires: RequiredDocument[];
  documents_optionnels?: RequiredDocument[];
  documents_conditionnels?: RequiredDocument[];
}

export interface ProcedureStep {
  ordre: number;
  titre: string;
  description: string;
  documents_requis?: string[];
  canaux?: string[];
  delai?: string;
  frais?: string[];
  responsable: string;
  preavis?: string;
  preavis_recommande?: string;
}

export interface Procedure {
  id: string;
  titre: string;
  description: string;
  type_client: string[];
  delai_estime?: string;
  duree_max?: string;
  etapes: ProcedureStep[];
  restrictions?: string;
  note?: string;
  fournisseurs: string[];
}

export interface PowerOption {
  value: string;
  label: string;
  description: string;
  type: 'monophase' | 'triphase';
}

export interface PaymentMethod {
  id: string;
  mode: string;
  description: string;
  moyens_acceptes: string[];
  avantages: string[];
  inconvenients?: string[];
  fournisseurs: string[];
}

// ============================================================================
// COMPLAINT CATEGORIES
// ============================================================================

/**
 * Get all complaint categories
 */
export function getComplaintCategories(): ComplaintCategory[] {
  return reclamationsData.categories_reclamation;
}

/**
 * Get complaint types for a specific category
 */
export function getComplaintTypes(categoryId: string): ComplaintType[] {
  const category = reclamationsData.categories_reclamation.find(
    (cat: ComplaintCategory) => cat.id === categoryId
  );
  return category?.types || [];
}

/**
 * Get consumer rights for complaints
 */
export function getConsumerRights(): string[] {
  return reclamationsData.droits_consommateur_reclamation;
}

// ============================================================================
// REQUIRED DOCUMENTS
// ============================================================================

/**
 * Get required documents for residential new contract
 */
export function getResidentialDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.nouveau_contrat_residentiel as DocumentsForService;
}

/**
 * Get required documents for professional/company new contract
 */
export function getProfessionalDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.nouveau_contrat_professionnel as DocumentsForService;
}

/**
 * Get required documents for name/owner transfer
 */
export function getTransferDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.transfert_titulaire as DocumentsForService;
}

/**
 * Get required documents for power modification
 */
export function getPowerModificationDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.modification_puissance as DocumentsForService;
}

/**
 * Get required documents for termination
 */
export function getTerminationDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.resiliation as DocumentsForService;
}

/**
 * Get required documents for complaint
 */
export function getComplaintDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.reclamation as DocumentsForService;
}

/**
 * Get required documents for temporary connection
 */
export function getTemporaryConnectionDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.branchement_provisoire as DocumentsForService;
}

/**
 * Get required documents for reconnection
 */
export function getReconnectionDocuments(): DocumentsForService {
  return documentsRequisData.documents_par_service.reconnexion as DocumentsForService;
}

/**
 * Get documents based on contract type (residential vs professional)
 */
export function getContractDocuments(isCompany: boolean): DocumentsForService {
  return isCompany ? getProfessionalDocuments() : getResidentialDocuments();
}

/**
 * Get documents based on modification reason
 */
export function getModificationDocuments(reason: string): DocumentsForService | null {
  switch (reason) {
    case 'changeAddress':
      // For address change, need new occupation justification
      return getResidentialDocuments();
    case 'changePower':
      return getPowerModificationDocuments();
    case 'transferName':
      return getTransferDocuments();
    default:
      return null;
  }
}

// ============================================================================
// PROCEDURES
// ============================================================================

/**
 * Get procedure for new connection
 */
export function getNewConnectionProcedure(): Procedure {
  return proceduresData.procedures.nouveau_branchement as Procedure;
}

/**
 * Get procedure for contract termination
 */
export function getTerminationProcedure(): Procedure {
  return proceduresData.procedures.resiliation_contrat as Procedure;
}

/**
 * Get procedure for power modification
 */
export function getPowerModificationProcedure(): Procedure {
  return proceduresData.procedures.modification_puissance as Procedure;
}

/**
 * Get procedure for name/owner transfer
 */
export function getTransferProcedure(): Procedure {
  return proceduresData.procedures.transfert_nom as Procedure;
}

/**
 * Get procedure for address change
 */
export function getAddressChangeProcedure(): Procedure {
  return proceduresData.procedures.changement_adresse as Procedure;
}

/**
 * Get procedure for temporary connection
 */
export function getTemporaryConnectionProcedure(): Procedure {
  return proceduresData.procedures.branchement_provisoire as Procedure;
}

/**
 * Get procedure for reconnection
 */
export function getReconnectionProcedure(): Procedure {
  return proceduresData.procedures.reconnexion as Procedure;
}

/**
 * Get procedure based on modification reason
 */
export function getModificationProcedure(reason: string): Procedure | null {
  switch (reason) {
    case 'changeAddress':
      return getAddressChangeProcedure();
    case 'changePower':
      return getPowerModificationProcedure();
    case 'transferName':
      return getTransferProcedure();
    default:
      return null;
  }
}

// ============================================================================
// POWER OPTIONS
// ============================================================================

/**
 * Get available power options for form dropdowns
 * Returns formatted options suitable for form selects
 */
export function getPowerOptions(): PowerOption[] {
  const monophase = typesCompteursData.configurations_branchement.monophase;
  const triphase = typesCompteursData.configurations_branchement.triphase;

  const options: PowerOption[] = [];

  // Add monophase options
  monophase.puissances_disponibles.forEach((power: string) => {
    const kva = power.replace(' kVA', '');
    let description = '';
    switch (kva) {
      case '3':
        description = 'Petit logement';
        break;
      case '6':
        description = 'Logement standard';
        break;
      case '9':
        description = 'Grand logement';
        break;
      case '12':
        description = 'Grande maison';
        break;
    }
    options.push({
      value: kva,
      label: `${power} - ${description}`,
      description,
      type: 'monophase'
    });
  });

  // Add triphase option for companies
  options.push({
    value: 'triphase',
    label: '12+ kVA - Triphasé (Professionnel)',
    description: 'Usage professionnel ou industriel',
    type: 'triphase'
  });

  return options;
}

/**
 * Get suggested power based on property type and contract type
 */
export function getSuggestedPower(propertyType: string, isCompany: boolean): string {
  if (isCompany) {
    return 'triphase';
  }
  if (propertyType === 'newConstruction') {
    return '6'; // Default for new construction
  }
  return '6'; // Default standard
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Get all payment methods
 */
export function getPaymentMethods(): PaymentMethod[] {
  return modesPaiementData.modes_paiement;
}

/**
 * Get payment methods suitable for automatic billing
 */
export function getAutomaticPaymentMethods(): PaymentMethod[] {
  return modesPaiementData.modes_paiement.filter(
    (method: PaymentMethod) =>
      method.id === 'paie_004' || // Prélèvement automatique
      method.id === 'paie_002' || // Paiement en ligne
      method.id === 'paie_003'    // Application mobile
  );
}

/**
 * Get payment method options for form dropdown
 */
export function getPaymentMethodOptions(): { value: string; label: string }[] {
  const methods = getPaymentMethods();
  return methods.map((method: PaymentMethod) => ({
    value: method.id,
    label: method.mode
  }));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format document alternatives as a readable string
 */
export function formatDocumentAlternatives(alternatives: string[]): string {
  if (alternatives.length <= 1) {
    return alternatives[0] || '';
  }
  return alternatives.join(' OU ');
}

/**
 * Check if a document has alternatives
 */
export function hasAlternatives(document: RequiredDocument): boolean {
  return !!(document.alternatives && document.alternatives.length > 0);
}
