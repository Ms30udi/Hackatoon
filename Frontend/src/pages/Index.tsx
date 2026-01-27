/**
 * Index Page
 * 
 * Main landing page of the Service Intelligence Portal.
 * Serves as the entry point for users to access service request forms.
 * 
 * @module pages/Index
 */

import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServicePortal } from '@/components/ServicePortal';

/**
 * Index - Main application page
 * 
 * Combines the core layout components:
 * - Header with branding and language toggle
 * - ServicePortal with the request workflow
 * - Footer with contact info and legal notices
 * 
 * Wrapped in LanguageProvider for i18n support.
 */
const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <ServicePortal />
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
