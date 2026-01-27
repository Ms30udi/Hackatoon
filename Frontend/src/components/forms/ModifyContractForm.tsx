/**
 * ModifyContractForm Component
 * 
 * Form for requesting modifications to existing service contracts.
 * Supports various modification types with conditional field display.
 * 
 * @module components/forms/ModifyContractForm
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormTextarea } from '../FormTextarea';
import { cn } from '@/lib/utils';

interface ModifyContractFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Callback to navigate back to selection */
  onBack: () => void;
}

/** Available modification types */
type ModificationReason = 'changeFormula' | 'changePower' | 'changeAddress' | 'changeContact';

/**
 * ModifyContractForm - Contract modification request form
 * 
 * Multi-section form with the following sections:
 * 1. Contract identification (contract number, CIN)
 * 2. Modification reason selection
 * 3. Contact information
 * 4. New address fields (conditional, shown for address changes)
 * 5. Modification details textarea
 */
export const ModifyContractForm: React.FC<ModifyContractFormProps> = ({ onSubmit, onBack }) => {
  const { t } = useLanguage();

  // Form state management
  const [modificationReason, setModificationReason] = useState<ModificationReason | null>(null);
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
    onSubmit({ ...formData, modificationReason });
  };

  // Available modification reasons with localized labels
  const reasons: { key: ModificationReason; label: string }[] = [
    { key: 'changeFormula', label: t.changeFormula },
    { key: 'changePower', label: t.changePower },
    { key: 'changeAddress', label: t.changeAddress },
    { key: 'changeContact', label: t.changeContact },
  ];

  return (
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
          {reasons.map(({ key, label }) => {
            const isSelected = modificationReason === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setModificationReason(key)}
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
        <button type="submit" className="btn-institutional">
          {t.submit}
        </button>
      </div>
    </form>
  );
};
