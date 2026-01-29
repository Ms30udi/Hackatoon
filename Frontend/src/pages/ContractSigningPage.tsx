/**
 * ContractSigningPage Component
 * 
 * Allows the user to digitally sign the contract using a canvas.
 * Submits the signature to the backend to generate the final signed contract.
 */

import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, Eraser, PenLine, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ContractSigningPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const sigCanvas = useRef<SignatureCanvas>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Helper translations
    const t = {
        title: language === 'en' ? 'Sign Your Contract' : 'Signez Votre Contrat',
        subtitle: language === 'en'
            ? 'Please sign below to finalize your energy supply agreement'
            : 'Veuillez signer ci-dessous pour finaliser votre contrat de fourniture d\'énergie',
        clear: language === 'en' ? 'Clear' : 'Effacer',
        submit: language === 'en' ? 'Validate Signature' : 'Valider la Signature',
        submitting: language === 'en' ? 'Processing...' : 'Traitement...',
        successTitle: language === 'en' ? 'Contract Signed!' : 'Contrat Signé !',
        successMsg: language === 'en'
            ? 'Your contract has been generated and sent to your email.'
            : 'Votre contrat a été généré et envoyé à votre adresse e-mail.',
        back: language === 'en' ? 'Back' : 'Retour'
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
    };

    const submitSignature = async () => {
        if (!id) return;

        if (sigCanvas.current?.isEmpty()) {
            toast.error(language === 'en' ? 'Please provide a signature' : 'Veuillez fournir une signature');
            return;
        }

        try {
            setIsSubmitting(true);

            // Use getCanvas() instead of getTrimmedCanvas(). 
            // Although getTrimmedCanvas is useful, it sometimes causes issues if dependencies aren't aligned.
            // Sending the full canvas with transparent background is perfectly fine for overlay.
            const dataUrl = sigCanvas.current?.getCanvas().toDataURL('image/png');

            // Convert dataURL to Blob for FormData upload is often cleaner, 
            // but sending JSON with base64 string is also fine. 
            // Let's send JSON for simplicity unless backend strictly needs file.
            // Actually backend usually expects file for 'UploadFile'. 
            // Let's create a blob to send as a file.

            const res = await fetch(dataUrl!);
            const blob = await res.blob();
            const file = new File([blob], 'signature.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('signature_image', file);

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${apiBaseUrl}/contracts/${id}/sign`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to sign contract');
            }

            setIsSuccess(true);
            toast.success(t.successTitle);

        } catch (error) {
            console.error('Signing error:', error);
            toast.error(language === 'en' ? 'Failed to submit signature' : 'Échec de l\'envoi de la signature');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6 animate-fade-in-up">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-100 rounded-full blur-xl" />
                            <CheckCircle2 className="w-24 h-24 text-green-600 relative" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">{t.successTitle}</h1>
                    <p className="text-gray-600">
                        {t.successMsg}
                    </p>
                    <div className="pt-4">
                        <Button onClick={() => navigate('/')} className="w-full">
                            {language === 'en' ? 'Return to Home' : 'Retour à l\'accueil'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            {/* Header */}
            <div className="max-w-3xl w-full space-y-2 mb-8 text-center">
                <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center justify-center gap-3">
                    <PenLine className="w-8 h-8 text-primary" />
                    {t.title}
                </h1>
                <p className="text-gray-500">{t.subtitle}</p>
            </div>

            <div className="bg-white p-1 rounded-xl shadow-xl w-full max-w-3xl border border-gray-200">
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                            className: 'w-full h-[400px] cursor-crosshair rounded-lg'
                        }}
                        backgroundColor="rgba(0,0,0,0)"
                    />
                    <div className="absolute bottom-4 left-4 text-xs text-gray-400 pointer-events-none">
                        {language === 'en' ? 'Sign above using mouse or touch' : 'Signez ci-dessus avec la souris ou le doigt'}
                    </div>
                </div>
            </div>

            <div className="max-w-3xl w-full mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Button
                    variant="outline"
                    onClick={clearSignature}
                    className="w-full sm:w-auto flex gap-2"
                >
                    <Eraser className="w-4 h-4" />
                    {t.clear}
                </Button>

                <div className="flex gap-4 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        disabled={isSubmitting}
                    >
                        {t.back}
                    </Button>
                    <Button
                        onClick={submitSignature}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                {t.submitting}
                            </span>
                        ) : (
                            t.submit
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
