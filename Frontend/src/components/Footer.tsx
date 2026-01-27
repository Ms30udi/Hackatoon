/**
 * Footer Component
 * 
 * Site footer with contact information and legal notices.
 * Displays help line and data protection information.
 * 
 * @module components/Footer
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Shield } from 'lucide-react';

/**
 * Footer - Main site footer component
 * 
 * Provides:
 * - Customer service contact information
 * - Data protection notice
 * - Responsive layout for mobile and desktop
 */
export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-secondary/30 mt-auto">
      <div className="container-wide py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          {/* Help Line Contact */}
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" strokeWidth={1.5} />
            <span>{t.helpLine}</span>
          </div>

          {/* Data Protection Notice */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" strokeWidth={1.5} />
            <span>{t.dataProtection}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
