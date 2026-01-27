/**
 * NewConnectionForm Component
 * 
 * Form for requesting new utility connections.
 * Supports both new construction and existing building connections
 * with different entity types (individual/household/company).
 * 
 * @module components/forms/NewConnectionForm
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormTextarea } from '../FormTextarea';
import { ContractTypeSelector, ContractType } from '../ContractTypeSelector';
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
 */
export const NewConnectionForm: React.FC<NewConnectionFormProps> = ({ onSubmit, onBack }) => {
  const { t } = useLanguage();

  // Form state management
  const [contractType, setContractType] = useState<ContractType>('individual');
  const [propertyType, setPropertyType] = useState<PropertyType>('newConstruction');
  const [formData, setFormData] = useState<Record<string, string>>({});

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
    onSubmit({ ...formData, contractType, propertyType });
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
          <FormInput
            label={t.estimatedPower}
            name="estimatedPower"
            placeholder={t.estimatedPowerPlaceholder}
            value={formData.estimatedPower || ''}
            onChange={handleChange}
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
