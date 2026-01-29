/**
 * ServicePortal Component
 * 
 * Main portal interface for handling customer service requests.
 * Manages the complete request flow from type selection through
 * form submission to confirmation display.
 * 
 * @module components/ServicePortal
 */

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RequestTypeSelector, RequestType } from './RequestTypeSelector';
import { NewContractForm } from './forms/NewContractForm';
import { ModifyContractForm } from './forms/ModifyContractForm';
import { InformationRequestForm } from './forms/InformationRequestForm';
import { NewConnectionForm } from './forms/NewConnectionForm';
import { ConfirmationScreen } from './ConfirmationScreen';
import { ContractPage } from '@/pages/ContractPage';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Possible states of the portal workflow */
type PortalState = 'selection' | 'form' | 'confirmation' | 'contract';

/**
 * ServicePortal - Primary component for the service request workflow
 * 
 * Implements a four-step process:
 * 1. Selection: User chooses the type of request
 * 2. Form: User fills out the appropriate form (or contract workflow)
 * 3. Confirmation: Display success message with reference number
 * 4. Contract: Complete contract digitalization workflow
 */
export const ServicePortal: React.FC = () => {
  const { t } = useLanguage();

  // Portal state management
  const [portalState, setPortalState] = useState<PortalState>('selection');
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  const [referenceNumber, setReferenceNumber] = useState('');

  /**
   * Generates a unique reference number for submitted requests
   * Format: REF-{timestamp}-{random}
   */
  const generateReferenceNumber = useCallback(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REF-${timestamp}-${random}`;
  }, []);

  /** Handles request type selection from the selector grid */
  const handleSelectType = useCallback((type: RequestType) => {
    setSelectedType(type);
  }, []);

  /** Advances from selection to form state when a type is chosen */
  const handleContinue = useCallback(() => {
    if (selectedType) {
      // Route to contract workflow for digitalization
      if (selectedType === 'newContract') {
        setPortalState('contract');
      } else {
        setPortalState('form');
      }
    }
  }, [selectedType]);

  /** Returns to the selection state from the form */
  const handleBack = useCallback(() => {
    setPortalState('selection');
  }, []);

  /** Returns from contract page to selection */
  const handleBackFromContract = useCallback(() => {
    setPortalState('selection');
    setSelectedType(null);
  }, []);

  /**
   * Processes form submission
   * Sends data to backend and transitions to confirmation
   */
  const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
    console.log('Submitting form:', { type: selectedType, data });

    try {
      let endpoint = '';
      switch (selectedType) {
        case 'newContract':
          endpoint = '/api/contracts/new';
          break;
        case 'modifyContract':
          endpoint = '/api/contracts/modify';
          break;
        case 'information':
          endpoint = '/api/complaints/new';
          break;
        case 'newConnection':
          endpoint = '/api/connections/new';
          break;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const result = await response.json();
      setReferenceNumber(result.contract_number || result.reference_number || generateReferenceNumber());
      setPortalState('confirmation');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
    }
  }, [selectedType, generateReferenceNumber]);

  /** Resets the portal to initial state for a new request */
  const handleNewRequest = useCallback(() => {
    setPortalState('selection');
    setSelectedType(null);
    setReferenceNumber('');
  }, []);

  /**
   * Renders the appropriate form component based on selected type
   */
  const renderForm = () => {
    switch (selectedType) {
      case 'newContract':
        return <NewContractForm onSubmit={handleSubmit} onBack={handleBack} />;
      case 'modifyContract':
        return <ModifyContractForm onSubmit={handleSubmit} onBack={handleBack} />;
      case 'information':
        return <InformationRequestForm onSubmit={handleSubmit} onBack={handleBack} />;
      case 'newConnection':
        return <NewConnectionForm onSubmit={handleSubmit} onBack={handleBack} />;
      default:
        return null;
    }
  };

  /** Gets the localized title for the current form type */
  const getFormTitle = () => {
    if (!selectedType) return '';
    return t.requestTypes[selectedType].title;
  };

  return (
    <main className="flex-1 py-12 md:py-16">
      <div className="container-institutional">
        {/* Confirmation State */}
        {portalState === 'confirmation' && (
          <ConfirmationScreen
            referenceNumber={referenceNumber}
            onNewRequest={handleNewRequest}
          />
        )}

        {/* Contract Workflow State */}
        {portalState === 'contract' && (
          <ContractPage onBack={handleBackFromContract} />
        )}

        {/* Selection State */}
        {portalState === 'selection' && (
          <div className="animate-fade-in-up">
            <header className="text-center mb-12">
              <h1 className="text-institutional-heading mb-4">
                {t.mainHeading}
              </h1>
              <p className="text-institutional-subheading max-w-2xl mx-auto">
                {t.mainSubheading}
              </p>
            </header>

            <RequestTypeSelector
              selected={selectedType}
              onSelect={handleSelectType}
            />

            <div className={cn(
              'flex justify-center mt-10 transition-all duration-500',
              selectedType ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            )}>
              <button
                onClick={handleContinue}
                className="btn-institutional group"
                disabled={!selectedType}
              >
                {t.continue}
                <ArrowRight
                  className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        )}

        {/* Form State */}
        {portalState === 'form' && (
          <div>
            <header className="mb-10">
              <h2 className="text-institutional-heading">
                {getFormTitle()}
              </h2>
              <div className="mt-4 h-0.5 w-16 bg-accent" />
            </header>

            {renderForm()}
          </div>
        )}
      </div>
    </main>
  );
};
