/**
 * NewContractForm Component
 * 
 * Multi-section form for creating new service contracts.
 * Supports individual, household, and company contract types
 * with conditional fields based on selection.
 * 
 * @module components/forms/NewContractForm
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { ContractTypeSelector, ContractType } from '../ContractTypeSelector';
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
 * 6. Contract start date
 */
export const NewContractForm: React.FC<NewContractFormProps> = ({ onSubmit, onBack }) => {
  const { t } = useLanguage();

  // Form state management
  const [contractType, setContractType] = useState<ContractType>('individual');
  const [formData, setFormData] = useState<Record<string, string>>({});

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
          <FormInput
            label={t.startDate}
            name="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={handleChange}
            required
          />
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
  );
};
