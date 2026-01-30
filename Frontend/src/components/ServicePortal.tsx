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

type PortalState = 'selection' | 'form' | 'confirmation' | 'contract';

export const ServicePortal: React.FC = () => {
  const { t } = useLanguage();

  const [portalState, setPortalState] = useState<PortalState>('selection');
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateReferenceNumber = useCallback(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REF-${timestamp}-${random}`;
  }, []);

  const handleSelectType = useCallback((type: RequestType) => {
    setSelectedType(type);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedType) {
      if (selectedType === 'newContract') {
        setPortalState('contract');
      } else {
        setPortalState('form');
      }
    }
  }, [selectedType]);

  const handleBack = useCallback(() => {
    setPortalState('selection');
  }, []);

  const handleBackFromContract = useCallback(() => {
    setPortalState('selection');
    setSelectedType(null);
  }, []);

  const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
    console.log('Submitting form:', { type: selectedType, data });
    setIsSubmitting(true);

    try {
      let endpoint = '';
      switch (selectedType) {
        case 'newContract':
          endpoint = '/contracts/draft';
          break;
        case 'modifyContract':
          endpoint = '/contracts/draft';
          break;
        case 'information':
          endpoint = '/complaints/';
          break;
        case 'newConnection':
          endpoint = '/contracts/draft';
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
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedType, generateReferenceNumber]);

  const handleNewRequest = useCallback(() => {
    setPortalState('selection');
    setSelectedType(null);
    setReferenceNumber('');
  }, []);

  const renderForm = () => {
    switch (selectedType) {
      case 'newContract':
        return <NewContractForm onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isSubmitting} />;
      case 'modifyContract':
        return <ModifyContractForm onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isSubmitting} />;
      case 'information':
        return <InformationRequestForm onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isSubmitting} />;
      case 'newConnection':
        return <NewConnectionForm onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

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
