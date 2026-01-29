/**
 * CINVerificationForm Component
 * 
 * Form for uploading CIN image for verification (STEP 2).
 * Uses OCR + Mistral to extract and verify identity.
 * Same styling as other forms.
 * 
 * @module components/forms/CINVerificationForm
 */

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Upload, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CINVerificationFormProps {
  contractId: number;
  customerName: string;
  onSuccess: (result: Record<string, unknown>) => void;
  onBack: () => void;
}

export const CINVerificationForm: React.FC<CINVerificationFormProps> = ({
  contractId,
  customerName,
  onSuccess,
  onBack
}) => {
  const { language } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState<Record<string, unknown> | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(language === 'en' ? 'Please select an image file' : 'Veuillez sélectionner une image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(language === 'en' ? 'File size is too large (5MB max)' : 'La taille du fichier est trop grande (5 MB max)');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError(language === 'en' ? 'Please select a CIN image' : 'Veuillez sélectionner une image CIN');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

      const formData = new FormData();
      formData.append('cin_image', selectedFile);

      const response = await fetch(`${apiBaseUrl}/contracts/${contractId}/upload-cin`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Verification failed');
      }

      const result = await response.json();
      
      // Check if verification was rejected by the backend
      if (result.status === 'rejected' || result.verification_status === 'rejected') {
        setError(
          language === 'en' 
            ? 'Identity verification failed: The information on your ID card does not match the data you provided. Please check your name and CIN number.'
            : 'La vérification d\'identité a échoué: Les informations sur votre carte d\'identité ne correspondent pas aux données fournies. Veuillez vérifier votre nom et votre numéro CIN.'
        );
        return;
      }
      
      setVerificationResult(result);

      // Call success callback after a brief delay (only if verified)
      setTimeout(() => {
        onSuccess(result);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationResult) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-xl" />
              <CheckCircle2 className="w-24 h-24 text-green-600 relative" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-medium text-foreground">
            {language === 'en' ? '✓ Verified Successfully' : '✓ Vérification réussie'}
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
            <p className="text-foreground font-medium">
              {language === 'en' 
                ? 'Your identity has been verified successfully!' 
                : 'Votre identité a été vérifiée avec succès!'}
            </p>
            <ul className="text-left space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>{language === 'en' ? 'Name matched' : 'Nom correspondant'}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>{language === 'en' ? 'CIN matched' : 'Numéro d\'identité correspondant'}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>{language === 'en' ? `Confidence: ${verificationResult.confidence_score}%` : `Confiance: ${verificationResult.confidence_score}%`}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-serif font-medium text-foreground">
              {language === 'en' ? 'Identity Verification' : 'Vérification d\'identité'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? 'Step 2: Upload your national ID card image' 
              : 'Étape 2: Téléchargez une image de votre carte d\'identité nationale'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Customer Info Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            {language === 'en' ? 'Verifying for:' : 'Vérification pour:'}
          </p>
          <p className="text-lg font-medium text-foreground">{customerName}</p>
        </div>

        {/* File Upload Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-serif font-medium text-foreground border-b border-border pb-3">
            {language === 'en' ? 'Upload CIN Image' : 'Télécharger l\'image CIN'}
          </h3>

          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-border hover:border-primary hover:bg-muted'
            )}
            onClick={() => document.getElementById('cin-input')?.click()}
          >
            <input
              id="cin-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="CIN Preview" 
                  className="max-h-[300px] mx-auto rounded-lg shadow-sm"
                />
                <p className="text-sm text-green-700 font-medium">
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-foreground font-medium">
                    {language === 'en' ? 'Click to upload image' : 'Cliquez pour télécharger une image'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'or drag and drop' 
                      : 'ou glisser-déposer'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-amber-900">
              {language === 'en' ? 'Image Requirements:' : 'Exigences de l\'image:'}
            </p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• {language === 'en' ? 'Clear photo of national ID card' : 'Photo claire de la carte d\'identité nationale'}</li>
              <li>• {language === 'en' ? 'Front side clearly visible' : 'Côté avant clairement visible'}</li>
              <li>• {language === 'en' ? 'File size up to 5 MB' : 'Taille du fichier jusqu\'à 5 MB'}</li>
              <li>• {language === 'en' ? 'Format: JPG, PNG or WebP' : 'Format: JPG, PNG ou WebP'}</li>
            </ul>
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
            disabled={isLoading || !selectedFile}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === 'en' ? 'Verifying...' : 'Vérification...'}
              </span>
            ) : (
              language === 'en' ? 'Verify' : 'Vérifier'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
