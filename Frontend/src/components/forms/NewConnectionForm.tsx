/**
 * NewConnectionForm Component
 *
 * Form for requesting new utility connections.
 * Supports both new construction and existing building connections
 * with different entity types (individual/household/company).
 * Includes procedure steps panel and power estimation helper.
 *
 * @module components/forms/NewConnectionForm
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { ContractTypeSelector, ContractType } from '../ContractTypeSelector';
import {
  getNewConnectionProcedure,
  getResidentialDocuments,
  getPowerOptions,
  getSuggestedPower,
  formatDocumentAlternatives,
  type ProcedureStep,
  type PowerOption,
  type RequiredDocument
} from '@/lib/knowledgeBase';
import { cn } from '@/lib/utils';

interface NewConnectionFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Callback to navigate back to selection */
  onBack: () => void;
}

/** Type of property for the connection */
type PropertyType = 'newConstruction' | 'existingBuilding';

/**
 * NewConnectionForm - New utility connection request form
 *
 * Comprehensive form with the following sections:
 * 1. Contract type selection (individual/household/company)
 * 2. Personal information
 * 3. Company details (conditional, shown for company type)
 * 4. Connection details (property type, address, power requirements)
 * 5. Procedure steps panel (always visible)
 * 6. Required documents panel (always visible)
 */
export const NewConnectionForm: React.FC<NewConnectionFormProps> = ({ onSubmit, onBack }) => {
  const { t } = useLanguage();

  // Form state management
  const [contractType, setContractType] = useState<ContractType>('individual');
  const [propertyType, setPropertyType] = useState<PropertyType>('newConstruction');
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Get data from knowledge base
  const procedure = useMemo(() => getNewConnectionProcedure(), []);
  const requiredDocs = useMemo(() => getResidentialDocuments(), []);
  const powerOptions = useMemo(() => getPowerOptions(), []);

  const isCompany = contractType === 'company';

  // Get suggested power and filter options
  const suggestedPower = useMemo(
    () => getSuggestedPower(propertyType, isCompany),
    [propertyType, isCompany]
  );

  const filteredPowerOptions = useMemo(() => {
    const options = [{ value: '', label: t.selectPower }];
    powerOptions.forEach((opt: PowerOption) => {
      if (isCompany || opt.type === 'monophase') {
        options.push({ value: opt.value, label: opt.label });
      }
    });
    return options;
  }, [powerOptions, isCompany, t.selectPower]);

  /**
   * Handles changes to form input fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, contractType, propertyType });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form Column */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
          {/* Contract Type Selection */}
          <section className="space-y-6">
            <ContractTypeSelector selected={contractType} onSelect={setContractType} />
          </section>

          {/* Personal Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.personalInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label={t.cin}
                name="cin"
                placeholder={t.cinPlaceholder}
                value={formData.cin || ''}
                onChange={handleChange}
                required
              />
              <div className="hidden md:block" />
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

          {/* Company Fields Section (conditional) */}
          <section className={cn(
            'space-y-6 overflow-hidden transition-all duration-500',
            contractType === 'company' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.companyInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label={t.companyName}
                name="companyName"
                placeholder={t.companyNamePlaceholder}
                value={formData.companyName || ''}
                onChange={handleChange}
              />
              <FormInput
                label={t.registrationNumber}
                name="registrationNumber"
                placeholder={t.registrationNumberPlaceholder}
                value={formData.registrationNumber || ''}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Connection Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.connectionInfo}
            </h3>

            {/* Property Type Selection */}
            <div className="space-y-2">
              <label className="input-label">{t.propertyType}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'newConstruction' as const, label: t.newConstruction },
                  { key: 'existingBuilding' as const, label: t.existingBuilding },
                ].map(({ key, label }) => {
                  const isSelected = propertyType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPropertyType(key)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-sm border transition-all duration-300 text-left',
                        isSelected
                          ? 'border-primary/50 bg-primary/[0.02]'
                          : 'border-border bg-card hover:border-primary/20'
                      )}
                    >
                      {/* Radio indicator */}
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                        isSelected ? 'border-accent bg-accent' : 'border-border'
                      )}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                        )}
                      </div>
                      <span className={cn(
                        'text-sm font-medium transition-colors duration-300',
                        isSelected ? 'text-foreground' : 'text-foreground/80'
                      )}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connection Address and Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FormInput
                  label={t.address}
                  name="connectionAddress"
                  placeholder={t.addressPlaceholder}
                  value={formData.connectionAddress || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <FormInput
                label={t.city}
                name="connectionCity"
                placeholder={t.cityPlaceholder}
                value={formData.connectionCity || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.postalCode}
                name="connectionPostalCode"
                placeholder={t.postalCodePlaceholder}
                value={formData.connectionPostalCode || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.plotReference}
                name="plotReference"
                placeholder={t.plotReferencePlaceholder}
                value={formData.plotReference || ''}
                onChange={handleChange}
              />
              <FormSelect
                label={t.subscribedPower}
                name="estimatedPower"
                value={formData.estimatedPower || ''}
                onChange={handleChange}
                options={filteredPowerOptions}
                required
              />
            </div>

            {/* Power Suggestion Helper */}
            <div className="p-3 bg-accent/5 rounded-sm border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t.suggestedPower}:</span>{' '}
                {isCompany ? (
                  <span>12+ kVA / Triphasé pour usage professionnel</span>
                ) : propertyType === 'newConstruction' ? (
                  <span>6-9 kVA pour une construction neuve résidentielle</span>
                ) : (
                  <span>6 kVA pour un logement standard</span>
                )}
              </p>
            </div>
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
            <button type="submit" className="btn-institutional">
              {t.submit}
            </button>
          </div>
        </form>
      </div>

      {/* Info Panels Column (Always Visible) */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          {/* Procedure Steps Panel */}
          <div className="p-5 bg-muted/30 rounded-sm border border-border">
            <h4 className="font-serif font-medium text-foreground mb-1">
              {t.procedureSteps}
            </h4>
            <p className="text-xs text-muted-foreground mb-1">
              {t.procedureStepsInfo}
            </p>
            <p className="text-xs text-accent mb-4">
              <span className="font-medium">{t.estimatedDelay}:</span> {procedure.delai_estime}
            </p>

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
          </div>

          {/* Required Documents Panel */}
          <div className="p-5 bg-accent/5 rounded-sm border border-accent/20">
            <h4 className="font-serif font-medium text-foreground mb-1">
              {t.requiredDocuments}
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              {t.requiredDocumentsInfo}
            </p>

            <ul className="space-y-3">
              {requiredDocs.documents_obligatoires.map((doc: RequiredDocument) => (
                <li key={doc.id} className="text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 flex-shrink-0">&#9679;</span>
                    <div>
                      <span className="font-medium text-foreground">{doc.nom}</span>
                      {doc.alternatives && doc.alternatives.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDocumentAlternatives(doc.alternatives)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Additional docs for new construction */}
            {propertyType === 'newConstruction' && (
              <div className="mt-4 pt-3 border-t border-accent/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Construction neuve:</span>{' '}
                  Plan de situation et permis de construire requis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
