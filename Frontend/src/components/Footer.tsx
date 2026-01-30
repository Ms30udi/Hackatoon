import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-secondary/30 mt-auto">
      <div className="container-wide py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" strokeWidth={1.5} />
            <span>{t.helpLine}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
