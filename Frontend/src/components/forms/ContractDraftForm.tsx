/**
 * ContractDraftForm Component
 * 
 * Form for creating a new contract draft (STEP 1).
 * Collects customer information and contract details.
 * Uses same styling as existing forms.
 * 
 * @module components/forms/ContractDraftForm
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
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

  // CIN duplicate check state
  const [cinError, setCinError] = useState<string | null>(null);
  const [cinChecking, setCinChecking] = useState(false);
  const cinDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkCinExists = useCallback(async (cin: string) => {
    if (cin.length < 3) {
      setCinError(null);
      setCinChecking(false);
      return;
    }
    setCinChecking(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/customers/check-cin/${encodeURIComponent(cin)}`);
      const data = await res.json();
      setCinError(data.exists
        ? (language === 'en' ? 'This CIN already exists in the system' : 'Ce CIN existe déjà dans le système')
        : null
      );
    } catch {
      setCinError(null);
    } finally {
      setCinChecking(false);
    }
  }, [language]);

  useEffect(() => {
    return () => {
      if (cinDebounceRef.current) clearTimeout(cinDebounceRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'cin') {
      setCinError(null);
      if (cinDebounceRef.current) clearTimeout(cinDebounceRef.current);
      cinDebounceRef.current = setTimeout(() => checkCinExists(value), 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cinError) return;
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
        provider: formData.provider || 'ONEE',
        subscribed_power: parseFloat(formData.subscribedPower) || 6,
        applied_tariff: formData.appliedTariff || 'Tarif résidentiel',
        contract_address: formData.contractAddress || formData.address,
        // Enterprise fields
        company_name: formData.customerType === 'company' ? formData.companyName : undefined,
        legal_form: formData.customerType === 'company' ? formData.legalForm : undefined,
        trade_register: formData.customerType === 'company' ? formData.tradeRegister : undefined,
        ice_number: formData.customerType === 'company' ? formData.iceNumber : undefined,
        legal_representative_name: formData.customerType === 'company' ? formData.legalRepName : undefined,
        legal_representative_cin: formData.customerType === 'company' ? formData.legalRepCin : undefined,
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
              error={cinError || undefined}
              helper={cinChecking ? (language === 'en' ? 'Checking...' : 'Vérification...') : undefined}
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
        {/* Enterprise Information Section - Conditional */}
        {formData.customerType === 'company' && (
          <section className="space-y-6">
            <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
              {language === 'en' ? 'Company Information' : 'Informations de l\'entreprise'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label={language === 'en' ? 'Company Name' : 'Raison sociale'}
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                required
              />
              <FormSelect
                label={language === 'en' ? 'Legal Form' : 'Forme juridique'}
                name="legalForm"
                value={formData.legalForm || ''}
                onChange={handleChange}
                options={[
                  { value: 'SARL', label: 'SARL - Société à Responsabilité Limitée' },
                  { value: 'SA', label: 'SA - Société Anonyme' },
                  { value: 'SNC', label: 'SNC - Société en Nom Collectif' },
                  { value: 'SCS', label: 'SCS - Société en Commandite Simple' },
                  { value: 'Auto-entrepreneur', label: 'Auto-entrepreneur' }
                ]}
              />
              <FormInput
                label={language === 'en' ? 'Trade Register' : 'Registre de commerce'}
                name="tradeRegister"
                placeholder="RC123456"
                value={formData.tradeRegister || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label="ICE (Identifiant Commun de l'Entreprise)"
                name="iceNumber"
                placeholder="002345678000012"
                value={formData.iceNumber || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={language === 'en' ? 'Legal Representative Name' : 'Nom du représentant légal'}
                name="legalRepName"
                value={formData.legalRepName || ''}
                onChange={handleChange}
                required
              />
              <FormInput
                label={language === 'en' ? 'Legal Representative CIN' : 'CIN du représentant légal'}
                name="legalRepCin"
                value={formData.legalRepCin || ''}
                onChange={handleChange}
                required
              />
            </div>
          </section>
        )}

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
            <FormSelect
              label={language === 'en' ? 'Provider' : 'Fournisseur'}
              name="provider"
              value={formData.provider || 'ONEE'}
              onChange={handleChange}
              options={[
                { value: 'ONEE', label: 'ONEE - Office National de l\'Électricité et de l\'Eau Potable' },
                { value: 'LYDEC', label: 'LYDEC (Casablanca)' },
                { value: 'REDAL', label: 'REDAL (Rabat-Salé)' },
                { value: 'AMENDIS', label: 'AMENDIS (Tanger-Tétouan)' },
                { value: 'RADEEMA', label: 'RADEEMA (Marrakech)' }
              ]}
            />
            <FormSelect
              label={language === 'en' ? 'Subscribed Power' : 'Puissance souscrite'}
              name="subscribedPower"
              value={formData.subscribedPower || '6'}
              onChange={handleChange}
              options={[
                { value: '3', label: '3 kVA - ' + (language === 'en' ? 'Small apartment' : 'Petit logement') },
                { value: '6', label: '6 kVA - ' + (language === 'en' ? 'Standard apartment' : 'Logement standard') },
                { value: '9', label: '9 kVA - ' + (language === 'en' ? 'Large house' : 'Grand logement') },
                { value: '12', label: '12 kVA - ' + (language === 'en' ? 'Very large house' : 'Grande maison') },
                { value: '18', label: '18 kVA - ' + (language === 'en' ? 'Three-phase (Professional)' : 'Triphasé (Professionnel)') },
                { value: '24', label: '24 kVA - ' + (language === 'en' ? 'Three-phase (Industrial)' : 'Triphasé (Industriel)') },
                { value: '36', label: '36+ kVA - ' + (language === 'en' ? 'Three-phase (Heavy Industry)' : 'Triphasé (Industrie lourde)') }
              ]}
            />
            <FormSelect
              label={language === 'en' ? 'Applied Tariff' : 'Tarif appliqué'}
              name="appliedTariff"
              value={formData.appliedTariff || 'Tarif résidentiel'}
              onChange={handleChange}
              options={[
                { value: 'Tarif résidentiel', label: language === 'en' ? 'Residential Tariff (Progressive)' : 'Tarif résidentiel (Progressif)' },
                { value: 'Tarif professionnel BT', label: language === 'en' ? 'Professional Tariff (Low Voltage)' : 'Tarif professionnel (Basse Tension)' },
                { value: 'Tarif Général MT', label: language === 'en' ? 'General Tariff (Medium Voltage)' : 'Tarif Général (Moyenne Tension)' },
                { value: 'Tarif Optionnel MT', label: language === 'en' ? 'Optional Tariff MT (Peak/Off-peak)' : 'Tarif Optionnel MT (Heures pleines/creuses)' },
                { value: 'Tarif Optionnel Super Pointe', label: language === 'en' ? 'Super Peak Optional Tariff' : 'Tarif Optionnel Super Pointe' }
              ]}
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
