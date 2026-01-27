/**
 * InformationRequestForm Component
 * 
 * Form for submitting general information inquiries.
 * Collects contact details and allows free-form message input.
 * 
 * @module components/forms/InformationRequestForm
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormTextarea } from '../FormTextarea';

interface InformationRequestFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Callback to navigate back to selection */
  onBack: () => void;
}

/**
 * InformationRequestForm - General inquiry submission form
 * 
 * Simple two-section form containing:
 * 1. Contact information (name, email, phone)
 * 2. Request details (subject and message)
 */
export const InformationRequestForm: React.FC<InformationRequestFormProps> = ({ onSubmit, onBack }) => {
  const { t } = useLanguage();

  // Form field values
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
      {/* Contact Information Section */}
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
          />
        </div>
      </section>

      {/* Request Details Section */}
      <section className="space-y-6">
        <FormInput
          label={t.subject}
          name="subject"
          placeholder={t.subjectPlaceholder}
          value={formData.subject || ''}
          onChange={handleChange}
          required
        />
        <FormTextarea
          label={t.message}
          name="message"
          placeholder={t.messagePlaceholder}
          value={formData.message || ''}
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
