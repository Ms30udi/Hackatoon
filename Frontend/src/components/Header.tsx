/**
 * Header Component
 * 
 * Site header with logo, branding, and language toggle.
 * Displays consistently across all pages of the portal.
 * 
 * @module components/Header
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import logo from '@/assets/logo.png';

/**
 * Header - Main site header component
 * 
 * Renders the top navigation bar containing:
 * - Company logo and branding
 * - Site name and tagline (localized)
 * - Language toggle control
 */
export const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="w-full border-b border-border bg-card">
      <div className="container-wide py-4 flex items-center justify-between">
        {/* Logo and Branding */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-serif font-medium text-foreground leading-tight">
              {t.siteName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <LanguageToggle />
      </div>
    </header>
  );
};
