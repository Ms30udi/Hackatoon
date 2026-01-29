/**
 * ContractVerifiedScreen Component
 * 
 * Confirmation page shown after CIN verification.
 * Displays verification success message and email notification.
 * 
 * @module components/ContractVerifiedScreen
 */

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Clock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

interface ContractVerifiedScreenProps {
  customerEmail: string;
  customerName: string;
  contractId: number;
  onNewRequest: () => void;
}

export const ContractVerifiedScreen: React.FC<ContractVerifiedScreenProps> = ({
  customerEmail,
  customerName,
  contractId,
  onNewRequest
}) => {
  const { language } = useLanguage();
  const [emailSending, setEmailSending] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationEmail = async () => {
    try {
      setEmailSending(true);
      setError(null);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/contracts/${contractId}/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send email');
      }

      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      setError(language === 'en' ? 'Failed to send email. Please check your connection and try again.' : 'Échec de l\'envoi de l\'e-mail. Veuillez vérifier votre connexion et réessayer.');
    } finally {
      setEmailSending(false);
    }
  };

  useEffect(() => {
    sendVerificationEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8 animate-fade-in-up">
        {/* Main Success Icon & Message */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl" />
              <CheckCircle2 className="w-28 h-28 text-green-600 relative animate-bounce" />
            </div>
          </div>

          <h1 className="text-4xl font-serif font-medium text-foreground">
            {language === 'en' ? '✓ Verification Successful' : '✓ Vérification réussie'}
          </h1>

          <p className="text-lg text-muted-foreground">
            {language === 'en'
              ? 'Your identity has been verified successfully. An e-signature link will be sent to your email.'
              : 'Votre identité a été vérifiée avec succès. Un lien de signature électronique sera envoyé à votre e-mail.'}
          </p>
        </div>

        {/* Email Status Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${emailSending ? 'animate-pulse' : ''}`}>
              <Mail className={`w-8 h-8 ${emailSending ? 'text-blue-500' : 'text-green-600'}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif font-medium text-foreground mb-2">
                {language === 'en' ? '📧 Check Your Email' : '📧 Vérifiez votre e-mail'}
              </h2>
              <p className="text-foreground mb-2">
                {language === 'en' ? 'We have sent you an email containing:' : 'Nous vous avons envoyé un e-mail contenant:'}
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-foreground">
                  <span className="text-green-600">✓</span>
                  {language === 'en' ? '2 Contract Documents (PDF)' : '2 Documents de contrat (PDF)'}
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <span className="text-green-600">✓</span>
                  {language === 'en' ? 'E-Signature Link' : 'Lien de signature électronique'}
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <span className="text-green-600">✓</span>
                  {language === 'en' ? 'Completion Instructions' : 'Instructions de réalisation'}
                </li>
              </ul>
            </div>
          </div>

          {/* Email Address */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-muted-foreground mb-1">
              {language === 'en' ? 'Email Address:' : 'Adresse e-mail:'}
            </p>
            <p className="text-lg font-medium text-foreground break-all">
              {customerEmail}
            </p>
          </div>

          {/* Email Status */}
          {error ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <Button
                onClick={sendVerificationEmail}
                variant="outline"
                size="sm"
                className="self-start gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'en' ? 'Try Again' : 'Réessayer'}
              </Button>
            </div>
          ) : emailSending ? (
            <div className="flex items-center gap-3 text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Sending email...' : 'Envoi d\'un e-mail...'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Email sent successfully' : 'E-mail envoyé avec succès'}
              </span>
            </div>
          )}
        </div>

        {/* Next Steps Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            {language === 'en' ? 'What to do next:' : 'Quoi faire ensuite:'}
          </h3>
          <ol className="space-y-3 ml-6">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span className="text-foreground">
                {language === 'en'
                  ? 'Open your email and look for our message'
                  : 'Ouvrez votre email et recherchez notre message'}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span className="text-foreground">
                {language === 'en'
                  ? 'Read the contract documents (PDF files) carefully'
                  : 'Lisez attentivement les documents du contrat (fichiers PDF)'}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span className="text-foreground">
                {language === 'en'
                  ? 'Click the "Sign Your Contract" link in the email'
                  : 'Cliquez sur le lien "Signez votre contrat" dans l\'email'}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span className="text-foreground">
                {language === 'en'
                  ? 'Sign the contract using your mouse or touchpad'
                  : 'Signez le contrat à l\'aide de votre souris ou de votre pavé tactile'}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </span>
              <span className="text-foreground">
                {language === 'en'
                  ? 'Complete the process and your contract will be activated'
                  : 'Complétez le processus et votre contrat sera activé'}
              </span>
            </li>
          </ol>
        </div>

        {/* Important Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
          <h3 className="font-serif font-medium text-foreground">
            {language === 'en' ? '⏱️ Important:' : '⏱️ Important:'}
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              {language === 'en'
                ? 'The signature link is valid for 30 days'
                : 'Le lien de signature est valide pendant 30 jours'}
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              {language === 'en'
                ? 'After signing, the final contract will be sent to your email'
                : 'Après signature, le contrat final vous sera envoyé par email'}
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              {language === 'en'
                ? 'If you don\'t receive the email, check your spam folder'
                : 'Si vous ne recevez pas l\'email, vérifiez votre dossier spam'}
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              {language === 'en'
                ? 'Contract ID: ' + contractId
                : 'ID de contrat: ' + contractId}
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 justify-center pt-6 border-t border-border">
          <Button
            onClick={onNewRequest}
            variant="outline"
            className="flex items-center gap-2"
          >
            {language === 'en' ? 'Back to Start' : 'Retour au début'}
          </Button>
          <Button
            className="flex items-center gap-2"
            disabled={emailSending}
          >
            {language === 'en' ? 'Done' : 'Terminé'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
