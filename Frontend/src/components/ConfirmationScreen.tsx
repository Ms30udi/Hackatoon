/**
 * ConfirmationScreen Component
 * 
 * Success screen displayed after form submission.
 * Shows a reference number for tracking the request.
 * 
 * @module components/ConfirmationScreen
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle } from 'lucide-react';

interface ConfirmationScreenProps {
  /** Unique reference number for the submitted request */
  referenceNumber: string;
  /** Callback to start a new request */
  onNewRequest: () => void;
}

/**
 * ConfirmationScreen - Request submission success display
 * 
 * Provides visual confirmation that a request was submitted successfully.
 * Displays:
 * - Success icon and message
 * - Unique reference number for tracking
 * - Option to submit another request
 */
export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  referenceNumber,
  onNewRequest,
}) => {
  const { t } = useLanguage();

  return (
    <div className="text-center py-12 animate-scale-in">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-success" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-serif font-medium text-foreground mb-3">
        {t.confirmationTitle}
      </h2>

      {/* Confirmation Message */}
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {t.confirmationMessage}
      </p>

      {/* Reference Number Display */}
      <div className="bg-secondary/50 rounded-sm p-6 max-w-sm mx-auto mb-8">
        <p className="text-sm text-muted-foreground mb-2">
          {t.referenceNumber}
        </p>
        <p className="text-xl font-mono font-medium text-foreground tracking-wider">
          {referenceNumber}
        </p>
      </div>

      {/* New Request Button */}
      <button
        onClick={onNewRequest}
        className="btn-secondary-institutional"
      >
        {t.newRequest}
      </button>
    </div>
  );
};
