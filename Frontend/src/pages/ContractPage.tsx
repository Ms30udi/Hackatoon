/**
 * ContractPage Component
 * 
 * Manages the complete contract workflow:
 * - Step 1: Draft contract (customer info + contract details)
 * - Step 2: CIN verification (upload + OCR + verify)
 * - Step 3: Verification success (check email for signature link)
 * 
 * @module pages/ContractPage
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContractDraftForm } from '@/components/forms/ContractDraftForm';
import { CINVerificationForm } from '@/components/forms/CINVerificationForm';
import { ContractVerifiedScreen } from '@/components/ContractVerifiedScreen';
import { Stepper } from '../components/ui/stepper';

type ContractStep = 'draft' | 'verification' | 'verified';

interface ContractData {
  contractId: number;
  customerName: string;
  customerEmail: string;
  firstName: string;
  lastName: string;
}

export const ContractPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useLanguage();

  const [currentStep, setCurrentStep] = useState<ContractStep>('draft');
  const [contractData, setContractData] = useState<ContractData | null>(null);

  const handleDraftSubmit = (data: Record<string, unknown>, contractId: number) => {
    setContractData({
      contractId,
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email as string,
      firstName: data.firstName as string,
      lastName: data.lastName as string,
    });
    setCurrentStep('verification');
  };

  const handleVerificationSuccess = () => {
    setCurrentStep('verified');
  };

  const handleNewRequest = () => {
    setCurrentStep('draft');
    setContractData(null);
  };

  const handleBack = () => {
    if (currentStep === 'verification') {
      setCurrentStep('draft');
    } else {
      onBack();
    }
  };

  const steps = [
    { number: 1, label: language === 'en' ? 'Personal Data' : 'Données personnelles' },
    { number: 2, label: language === 'en' ? 'Verify Identity' : "Vérifier l'identité" },
    { number: 3, label: language === 'en' ? 'Confirmation' : 'Confirmation' },
  ];

  const getStepIndex = () => {
    switch (currentStep) {
      case 'draft':
        return 0;
      case 'verification':
        return 1;
      case 'verified':
        return 2;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <Stepper steps={steps} currentStep={getStepIndex()} />

      {/* Content */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
        {currentStep === 'draft' && (
          <ContractDraftForm
            onSubmit={handleDraftSubmit}
            onBack={onBack}
          />
        )}

        {currentStep === 'verification' && contractData && (
          <CINVerificationForm
            contractId={contractData.contractId}
            customerName={contractData.customerName}
            onSuccess={handleVerificationSuccess}
            onBack={handleBack}
          />
        )}

        {currentStep === 'verified' && contractData && (
          <ContractVerifiedScreen
            customerEmail={contractData.customerEmail}
            customerName={contractData.customerName}
            contractId={contractData.contractId}
            onNewRequest={handleNewRequest}
          />
        )}
      </div>
    </div>
  );
};
