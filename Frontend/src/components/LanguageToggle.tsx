import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  /**
   * Generates button styling based on active state
   */
  const getButtonClasses = (lang: 'fr' | 'en') => {
    const isActive = language === lang;
    return `px-2.5 py-1.5 rounded-sm transition-all duration-300 ${isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`;
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLanguage('fr')}
        className={getButtonClasses('fr')}
        aria-label={t.french}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={getButtonClasses('en')}
        aria-label={t.english}
      >
        EN
      </button>
    </div>
  );
};
