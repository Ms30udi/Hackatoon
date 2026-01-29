/**
 * ModifyContractForm Component
 *
 * Form for requesting modifications to existing service contracts.
 * Supports various modification types with conditional field display.
 * Shows relevant required documents and procedure steps based on modification type.
 *
 * @module components/forms/ModifyContractForm
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormTextarea } from '../FormTextarea';
import {
  getModificationDocuments,
  getModificationProcedure,
  getPowerModificationDocuments,
  getTransferDocuments,
  getPowerModificationProcedure,
  getTransferProcedure,
  getAddressChangeProcedure,
  formatDocumentAlternatives,
  type DocumentsForService,
  type Procedure,
  type ProcedureStep,
  type RequiredDocument
} from '@/lib/knowledgeBase';
import { cn } from '@/lib/utils';

interface ModifyContractFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Callback to navigate back to selection */
  onBack: () => void;
  /** Whether the form is currently being submitted */
  isSubmitting?: boolean;
}

/** Available modification types */
type ModificationReason = 'changeFormula' | 'changePower' | 'changeAddress' | 'changeContact' | 'transferName';

/**
 * ModifyContractForm - Contract modification request form
 *
 * Multi-section form with the following sections:
 * 1. Contract identification (contract number, CIN)
 * 2. Modification reason selection
 * 3. Contact information
 * 4. New address fields (conditional, shown for address changes)
 * 5. Modification details textarea
 * 6. Required documents panel (conditional based on modification type)
 * 7. Procedure steps panel (conditional based on modification type)
 */
export const ModifyContractForm: React.FC<ModifyContractFormProps> = ({ onSubmit, onBack, isSubmitting }) => {
  const { t } = useLanguage();

  // Form state management
  const [modificationReason, setModificationReason] = useState<ModificationReason | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Get documents and procedure based on modification reason
  const { documents, procedure } = useMemo(() => {
    let docs: DocumentsForService | null = null;
    let proc: Procedure | null = null;

    switch (modificationReason) {
      case 'changePower':
        docs = getPowerModificationDocuments();
        proc = getPowerModificationProcedure();
        break;
      case 'changeAddress':
        proc = getAddressChangeProcedure();
        break;
      case 'transferName':
        docs = getTransferDocuments();
        proc = getTransferProcedure();
        break;
      default:
        break;
    }

    return { documents: docs, procedure: proc };
  }, [modificationReason]);

  /**
   * Handles changes to form input fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, modificationReason });
  };

  // Available modification reasons with localized labels
  const reasons: { key: ModificationReason; label: string; description: string }[] = [
    { key: 'changeFormula', label: t.changeFormula, description: 'Passer à une formule différente' },
    { key: 'changePower', label: t.changePower, description: 'Augmenter ou diminuer la puissance' },
    { key: 'changeAddress', label: t.changeAddress, description: 'Déménager vers une nouvelle adresse' },
    { key: 'changeContact', label: t.changeContact, description: 'Modifier email, téléphone' },
    { key: 'transferName', label: 'Transfert de nom', description: 'Changer le titulaire du contrat' },
  ];

  // Check if we have info panels to show
  const hasInfoPanels = documents || procedure;

  return (
    <div className={cn(
      'grid gap-8',
      hasInfoPanels ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
    )}>
      {/* Main Form Column */}
      <div className={hasInfoPanels ? 'lg:col-span-2' : ''}>
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
          {/* Contract Identification Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.contractDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label={t.contractNumber}
                name="contractNumber"
                placeholder={t.contractNumberPlaceholder}
                value={formData.contractNumber || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.cin}
                name="cin"
                placeholder={t.cinPlaceholder}
                value={formData.cin || ''}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* Modification Reason Selection */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.modificationReason}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reasons.map(({ key, label, description }) => {
                const isSelected = modificationReason === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setModificationReason(key)}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-sm border transition-all duration-300 text-left',
                      isSelected
                        ? 'border-primary/50 bg-primary/[0.02]'
                        : 'border-border bg-card hover:border-primary/20'
                    )}
                  >
                    {/* Radio indicator */}
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-0.5',
                      isSelected ? 'border-accent bg-accent' : 'border-border'
                    )}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                      )}
                    </div>
                    <div>
                      <span className={cn(
                        'text-sm font-medium transition-colors duration-300 block',
                        isSelected ? 'text-foreground' : 'text-foreground/80'
                      )}>
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Personal Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.personalInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label={t.firstName}
                name="firstName"
                placeholder={t.firstNamePlaceholder}
                value={formData.firstName || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.lastName}
                name="lastName"
                placeholder={t.lastNamePlaceholder}
                value={formData.lastName || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.email}
                name="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.phone}
                name="phone"
                type="tel"
                placeholder={t.phonePlaceholder}
                value={formData.phone || ''}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* New Address Section (conditional) */}
          <section className={cn(
            'space-y-6 overflow-hidden transition-all duration-500',
            modificationReason === 'changeAddress' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.addressInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FormInput
                  label={t.address}
                  name="newAddress"
                  placeholder={t.addressPlaceholder}
                  value={formData.newAddress || ''}
                  onChange={handleChange}
                />
              </div>
              <FormInput
                label={t.city}
                name="newCity"
                placeholder={t.cityPlaceholder}
                value={formData.newCity || ''}
                onChange={handleChange}
              />
              <FormInput
                label={t.postalCode}
                name="newPostalCode"
                placeholder={t.postalCodePlaceholder}
                value={formData.newPostalCode || ''}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Transfer Name Section (conditional) */}
          <section className={cn(
            'space-y-6 overflow-hidden transition-all duration-500',
            modificationReason === 'transferName' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              Nouveau titulaire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Prénom du nouveau titulaire"
                name="newHolderFirstName"
                placeholder="Prénom"
                value={formData.newHolderFirstName || ''}
                onChange={handleChange}
              />
              <FormInput
                label="Nom du nouveau titulaire"
                name="newHolderLastName"
                placeholder="Nom"
                value={formData.newHolderLastName || ''}
                onChange={handleChange}
              />
              <FormInput
                label="CIN du nouveau titulaire"
                name="newHolderCin"
                placeholder="Numéro CIN"
                value={formData.newHolderCin || ''}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Modification Details Section */}
          <section className="space-y-6">
            <FormTextarea
              label={t.modificationDetails}
              name="modificationDetails"
              placeholder={t.modificationDetailsPlaceholder}
              value={formData.modificationDetails || ''}
              onChange={handleChange}
              required
            />
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary-institutional"
            >
              {t.back}
            </button>
            <button type="submit" className="btn-institutional" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Panels Column (conditional based on modification type) */}
      {hasInfoPanels && (
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Procedure Steps Panel */}
            {procedure && (
              <div className="p-5 bg-muted/30 rounded-sm border border-border">
                <h4 className="font-serif font-medium text-foreground mb-1">
                  {t.procedureSteps}
                </h4>
                <p className="text-xs text-muted-foreground mb-1">
                  {procedure.titre}
                </p>
                {procedure.delai_estime && (
                  <p className="text-xs text-accent mb-4">
                    <span className="font-medium">{t.estimatedDelay}:</span> {procedure.delai_estime}
                  </p>
                )}

                <ol className="space-y-4">
                  {procedure.etapes.map((step: ProcedureStep) => (
                    <li key={step.ordre} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium">
                        {step.ordre}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{step.titre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {step.delai && (
                            <span className="text-xs text-accent/80">
                              {step.delai}
                            </span>
                          )}
                          <span className={cn(
                            'text-xs',
                            step.responsable === 'client' ? 'text-blue-600' : 'text-green-600'
                          )}>
                            {step.responsable === 'client' ? t.client : t.provider}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Special notes */}
                {procedure.note && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      {procedure.note}
                    </p>
                  </div>
                )}

                {procedure.restrictions && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-amber-600">
                      <span className="font-medium">Restriction:</span> {procedure.restrictions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Required Documents Panel */}
            {documents && (
              <div className="p-5 bg-accent/5 rounded-sm border border-accent/20">
                <h4 className="font-serif font-medium text-foreground mb-1">
                  {t.requiredDocuments}
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  {t.requiredDocumentsInfo}
                </p>

                <ul className="space-y-3">
                  {documents.documents_obligatoires.map((doc: RequiredDocument) => (
                    <li key={doc.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-accent mt-0.5 flex-shrink-0">&#9679;</span>
                        <div>
                          <span className="font-medium text-foreground">{doc.nom}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                          {doc.alternatives && doc.alternatives.length > 0 && (
                            <p className="text-xs text-accent/80 mt-1">
                              <span className="font-medium">{t.documentAlternatives}:</span>{' '}
                              {formatDocumentAlternatives(doc.alternatives)}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Conditional Documents */}
                {documents.documents_conditionnels && documents.documents_conditionnels.length > 0 && (
                  <>
                    <h5 className="font-medium text-foreground/80 mt-5 mb-2 text-sm">
                      Documents conditionnels
                    </h5>
                    <ul className="space-y-2">
                      {documents.documents_conditionnels.map((doc: RequiredDocument) => (
                        <li key={doc.id} className="text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">&#9675;</span>
                            <div>
                              <span className="text-foreground/80">{doc.nom}</span>
                              {doc.requis_si && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  <span className="font-medium">{t.conditionalDocument}:</span> {doc.requis_si}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Address Change Note */}
            {modificationReason === 'changeAddress' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Note importante:</span> Les contrats ne sont pas transférables d'une adresse à une autre. Un changement d'adresse nécessite la résiliation de l'ancien contrat et la souscription d'un nouveau.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
