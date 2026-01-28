/**
 * InformationRequestForm Component
 *
 * Form for submitting general information inquiries or complaints.
 * Supports two modes: information request and complaint submission.
 * When in complaint mode, shows category/type selectors and consumer rights.
 *
 * @module components/forms/InformationRequestForm
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormTextarea } from '../FormTextarea';
import { FormSelect } from '../FormSelect';
import { getComplaintCategories, getConsumerRights, type ComplaintCategory } from '@/lib/knowledgeBase';
import { cn } from '@/lib/utils';

interface InformationRequestFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Callback to navigate back to selection */
  onBack: () => void;
}

/** Type of request */
type RequestType = 'information' | 'complaint';

/**
 * InformationRequestForm - General inquiry or complaint submission form
 *
 * Sections:
 * 1. Request type toggle (information vs complaint)
 * 2. Complaint category & type (conditional, shown for complaints)
 * 3. Contact information (name, email, phone)
 * 4. Request details (subject and message)
 * 5. Consumer rights panel (shown for complaints)
 */
export const InformationRequestForm: React.FC<InformationRequestFormProps> = ({ onSubmit, onBack }) => {
  const { t, language } = useLanguage();

  // Form field values
  const [requestType, setRequestType] = useState<RequestType>('information');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Get complaint categories from knowledge base
  const complaintCategories = useMemo(() => getComplaintCategories(), []);
  const consumerRights = useMemo(() => getConsumerRights(), []);

  // Get complaint types for selected category
  const complaintTypes = useMemo(() => {
    if (!selectedCategory) return [];
    const category = complaintCategories.find((cat: ComplaintCategory) => cat.id === selectedCategory);
    return category?.types || [];
  }, [selectedCategory, complaintCategories]);

  // Category options for dropdown
  const categoryOptions = useMemo(() => [
    { value: '', label: t.selectCategory },
    ...complaintCategories.map((cat: ComplaintCategory) => ({
      value: cat.id,
      label: cat.categorie
    }))
  ], [complaintCategories, t.selectCategory]);

  // Type options for dropdown
  const typeOptions = useMemo(() => [
    { value: '', label: t.selectType },
    ...complaintTypes.map((type) => ({
      value: type.id,
      label: type.type
    }))
  ], [complaintTypes, t.selectType]);

  /**
   * Handles changes to form input fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handles category selection
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedType(''); // Reset type when category changes
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      requestType,
      ...(requestType === 'complaint' && {
        complaintCategory: selectedCategory,
        complaintType: selectedType
      })
    });
  };

  // Get selected type info for displaying delay
  const selectedTypeInfo = useMemo(() => {
    if (!selectedType) return null;
    return complaintTypes.find((type) => type.id === selectedType);
  }, [selectedType, complaintTypes]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
      {/* Request Type Toggle */}
      <section className="space-y-6">
        <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
          {t.requestType}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'information' as const, label: t.informationRequest },
            { key: 'complaint' as const, label: t.complaint },
          ].map(({ key, label }) => {
            const isSelected = requestType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setRequestType(key);
                  if (key === 'information') {
                    setSelectedCategory('');
                    setSelectedType('');
                  }
                }}
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

      {/* Complaint Category & Type (conditional) */}
      <section className={cn(
        'space-y-6 overflow-hidden transition-all duration-500',
        requestType === 'complaint' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
          {t.complaintCategory}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormSelect
            label={t.complaintCategory}
            name="complaintCategory"
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categoryOptions}
            required={requestType === 'complaint'}
          />
          <FormSelect
            label={t.complaintType}
            name="complaintType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={typeOptions}
            required={requestType === 'complaint' && !!selectedCategory}
            disabled={!selectedCategory}
          />
        </div>

        {/* Selected type info */}
        {selectedTypeInfo && (
          <div className="p-4 bg-muted/30 rounded-sm border border-border">
            <p className="text-sm text-muted-foreground mb-2">{selectedTypeInfo.description}</p>
            <p className="text-sm">
              <span className="font-medium">{t.estimatedDelay}:</span>{' '}
              <span className="text-accent">{selectedTypeInfo.delai_traitement}</span>
            </p>
          </div>
        )}

        {/* Consumer Rights Panel */}
        {requestType === 'complaint' && (
          <div className="p-4 bg-accent/5 rounded-sm border border-accent/20">
            <h4 className="font-medium text-foreground mb-3">{t.consumerRights}</h4>
            <p className="text-sm text-muted-foreground mb-3">{t.consumerRightsIntro}</p>
            <ul className="space-y-2">
              {consumerRights.map((right, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-accent mt-0.5">&#10003;</span>
                  <span>{right}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Contact Information Section */}
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
