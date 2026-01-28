/**
 * NewContractForm Component
 *
 * Multi-section form for creating new service contracts.
 * Supports individual, household, and company contract types
 * with conditional fields based on selection.
 * Includes power selection, required documents panel, and payment preference.
 *
 * @module components/forms/NewContractForm
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { ContractTypeSelector, ContractType } from '../ContractTypeSelector';
import {
  getPowerOptions,
  getContractDocuments,
  getPaymentMethodOptions,
  formatDocumentAlternatives,
  type PowerOption,
  type RequiredDocument
} from '@/lib/knowledgeBase';
import { cn } from '@/lib/utils';

interface NewContractFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Callback to navigate back to selection */
  onBack: () => void;
}

/**
 * NewContractForm - New service contract application form
 *
 * Multi-step form with the following sections:
 * 1. Contract type selection (individual/household/company)
 * 2. Personal information
 * 3. Address information
 * 4. Conditional household details (if household type)
 * 5. Conditional company details (if company type)
 * 6. Contract details (power, start date, payment preference)
 * 7. Required documents info panel (always visible)
 */
export const NewContractForm: React.FC<NewContractFormProps> = ({ onSubmit, onBack }) => {
  const { t } = useLanguage();

  // Form state management
  const [contractType, setContractType] = useState<ContractType>('individual');
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Get data from knowledge base
  const powerOptions = useMemo(() => getPowerOptions(), []);
  const paymentOptions = useMemo(() => [
    { value: '', label: t.selectPaymentMethod },
    ...getPaymentMethodOptions()
  ], [t.selectPaymentMethod]);

  // Get required documents based on contract type
  const isCompany = contractType === 'company';
  const requiredDocs = useMemo(() => getContractDocuments(isCompany), [isCompany]);

  // Filter power options based on contract type
  const filteredPowerOptions = useMemo(() => {
    const options = [{ value: '', label: t.selectPower }];
    powerOptions.forEach((opt: PowerOption) => {
      // Show all options for companies, only monophase for individuals/households
      if (isCompany || opt.type === 'monophase') {
        options.push({ value: opt.value, label: opt.label });
      }
    });
    return options;
  }, [powerOptions, isCompany, t.selectPower]);

  /**
   * Handles changes to form input fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, contractType });
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

          {/* Address Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.addressInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FormInput
                  label={t.address}
                  name="address"
                  placeholder={t.addressPlaceholder}
                  value={formData.address || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <FormInput
                label={t.city}
                name="city"
                placeholder={t.cityPlaceholder}
                value={formData.city || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={t.postalCode}
                name="postalCode"
                placeholder={t.postalCodePlaceholder}
                value={formData.postalCode || ''}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* Household-specific Fields (conditional) */}
          <section className={cn(
            'space-y-6 overflow-hidden transition-all duration-500',
            contractType === 'household' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.householdInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label={t.occupants}
                name="occupants"
                type="number"
                min="1"
                placeholder={t.occupantsPlaceholder}
                value={formData.occupants || ''}
                onChange={handleChange}
              />
              <FormSelect
                label={t.ownershipStatus}
                name="ownershipStatus"
                value={formData.ownershipStatus || ''}
                onChange={handleChange}
                options={[
                  { value: '', label: '—' },
                  { value: 'owner', label: t.owner },
                  { value: 'tenant', label: t.tenant },
                ]}
              />
            </div>
          </section>

          {/* Company-specific Fields (conditional) */}
          <section className={cn(
            'space-y-6 overflow-hidden transition-all duration-500',
            contractType === 'company' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
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
              <div className="md:col-span-2">
                <FormInput
                  label={t.companyAddress}
                  name="companyAddress"
                  placeholder={t.companyAddressPlaceholder}
                  value={formData.companyAddress || ''}
                  onChange={handleChange}
                />
              </div>
              <FormInput
                label={t.legalRepresentative}
                name="legalRepresentative"
                placeholder={t.legalRepresentativePlaceholder}
                value={formData.legalRepresentative || ''}
                onChange={handleChange}
              />
              <FormInput
                label={t.businessContact}
                name="businessContact"
                type="tel"
                placeholder={t.businessContactPlaceholder}
                value={formData.businessContact || ''}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Contract Details Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {t.contractDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormSelect
                label={t.subscribedPower}
                name="subscribedPower"
                value={formData.subscribedPower || ''}
                onChange={handleChange}
                options={filteredPowerOptions}
                required
              />
              <FormInput
                label={t.startDate}
                name="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={handleChange}
                required
              />
              <div className="md:col-span-2">
                <FormSelect
                  label={t.paymentMethodPreference}
                  name="paymentMethod"
                  value={formData.paymentMethod || ''}
                  onChange={handleChange}
                  options={paymentOptions}
                />
              </div>
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

      {/* Required Documents Info Panel (Always Visible) */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          {/* Required Documents Panel */}
          <div className="p-5 bg-muted/30 rounded-sm border border-border">
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

            {/* Optional Documents */}
            {requiredDocs.documents_optionnels && requiredDocs.documents_optionnels.length > 0 && (
              <>
                <h5 className="font-medium text-foreground/80 mt-5 mb-2 text-sm">
                  {t.optionalDocuments}
                </h5>
                <ul className="space-y-2">
                  {requiredDocs.documents_optionnels.map((doc: RequiredDocument) => (
                    <li key={doc.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5 flex-shrink-0">&#9675;</span>
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

          {/* Power Selection Helper */}
          <div className="p-4 bg-accent/5 rounded-sm border border-accent/20">
            <h5 className="font-medium text-foreground mb-2 text-sm">{t.suggestedPower}</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><span className="font-medium">3 kVA:</span> Studio, petit appartement</li>
              <li><span className="font-medium">6 kVA:</span> Appartement standard (2-3 pièces)</li>
              <li><span className="font-medium">9 kVA:</span> Grande maison, équipements électriques</li>
              <li><span className="font-medium">12 kVA:</span> Très grande maison, climatisation</li>
              {isCompany && (
                <li><span className="font-medium">Triphasé:</span> Usage professionnel, équipements industriels</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
