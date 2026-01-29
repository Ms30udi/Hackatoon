/**
 * ContractDraftForm Component
 * 
 * Form for creating a new contract draft (STEP 1).
 * Collects customer information and contract details.
 * Uses same styling as existing forms.
 * 
 * @module components/forms/ContractDraftForm
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractDraftFormProps {
  onSubmit: (data: Record<string, unknown>, contractId: number) => void;
  onBack: () => void;
}

export const ContractDraftForm: React.FC<ContractDraftFormProps> = ({ onSubmit, onBack }) => {
  const { t, language } = useLanguage();

  // Form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      // Prepare data for backend
      const payload = {
        full_name: `${formData.firstName} ${formData.lastName}`,
        national_id: formData.cin,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        customer_type: formData.customerType || 'individual',
        provider: formData.provider || 'Energy Company',
        subscribed_power: parseFloat(formData.subscribedPower) || 3,
        applied_tariff: formData.appliedTariff || 'Standard',
        contract_address: formData.contractAddress || formData.address
      };

      const response = await fetch(`${apiBaseUrl}/contracts/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create draft contract');
      }

      const result = await response.json();
      onSubmit(formData, result.id_contract);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-serif font-medium text-foreground">
              {language === 'en' ? 'Create New Contract' : 'Créer un nouveau contrat'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? 'Step 1: Enter your personal information and contract details' 
              : 'Étape 1: Entrez vos informations personnelles et les détails du contrat'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Personal Information Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
            {language === 'en' ? 'Personal Information' : 'Informations personnelles'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label={language === 'en' ? 'National ID (CIN)' : 'Numéro d\'identité national'}
              name="cin"
              placeholder={language === 'en' ? '12345678' : '12345678'}
              value={formData.cin || ''}
              onChange={handleChange}
              required
            />
            <div className="hidden md:block" />
            <FormInput
              label={language === 'en' ? 'First Name' : 'Prénom'}
              name="firstName"
              placeholder={language === 'en' ? 'John' : 'Jean'}
              value={formData.firstName || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label={language === 'en' ? 'Last Name' : 'Nom de famille'}
              name="lastName"
              placeholder={language === 'en' ? 'Doe' : 'Dupont'}
              value={formData.lastName || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label={language === 'en' ? 'Email' : 'E-mail'}
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label={language === 'en' ? 'Phone Number' : 'Numéro de téléphone'}
              name="phone"
              type="tel"
              placeholder="+216 XX XXX XXXX"
              value={formData.phone || ''}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        {/* Address Information Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
            {language === 'en' ? 'Address Information' : 'Informations d\'adresse'}
          </h3>
          <div className="grid grid-cols-1 gap-5">
            <FormInput
              label={language === 'en' ? 'Full Address' : 'Adresse complète'}
              name="address"
              placeholder={language === 'en' ? '123 Main Street, Tunis' : '123 rue Principale, Tunis'}
              value={formData.address || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label={language === 'en' ? 'Contract Address (if different)' : 'Adresse du contrat (si différente)'}
              name="contractAddress"
              placeholder={language === 'en' ? 'Leave empty if same as above' : 'Laissez vide si identique à ci-dessus'}
              value={formData.contractAddress || ''}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Contract Details Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
            {language === 'en' ? 'Contract Details' : 'Détails du contrat'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormSelect
              label={language === 'en' ? 'Customer Type' : 'Type de client'}
              name="customerType"
              value={formData.customerType || 'individual'}
              onChange={handleChange}
              options={[
                { value: 'individual', label: language === 'en' ? 'Individual' : 'Particulier' },
                { value: 'company', label: language === 'en' ? 'Company' : 'Entreprise' }
              ]}
            />
            <FormInput
              label={language === 'en' ? 'Provider' : 'Fournisseur'}
              name="provider"
              placeholder={language === 'en' ? 'Energy Company' : 'Compagnie d\'électricité'}
              value={formData.provider || ''}
              onChange={handleChange}
            />
            <FormInput
              label={language === 'en' ? 'Subscribed Power (kW)' : 'Puissance souscrite (kW)'}
              name="subscribedPower"
              type="number"
              step="0.1"
              placeholder="3"
              value={formData.subscribedPower || ''}
              onChange={handleChange}
            />
            <FormInput
              label={language === 'en' ? 'Applied Tariff' : 'Tarif appliqué'}
              name="appliedTariff"
              placeholder={language === 'en' ? 'Standard' : 'Standard'}
              value={formData.appliedTariff || ''}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'Retour'}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === 'en' ? 'Loading...' : 'Chargement...'}
              </span>
            ) : (
              language === 'en' ? 'Next' : 'Suivant'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
