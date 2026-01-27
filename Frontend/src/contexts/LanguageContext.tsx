/**
 * Language Context
 * 
 * Provides internationalization (i18n) support throughout the application.
 * Manages the current language state and provides translation access.
 * 
 * @module contexts/LanguageContext
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, Language } from '@/lib/translations';

/** Type definition for translation object structure */
type TranslationType = typeof translations.fr | typeof translations.en;

/** Context value shape for language management */
interface LanguageContextType {
  /** Current active language code */
  language: Language;
  /** Function to change the active language */
  setLanguage: (lang: Language) => void;
  /** Translation object for the current language */
  t: TranslationType;
}

// Create context with undefined default
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider - Context provider for language/translation state
 * 
 * Wraps the application to provide:
 * - Current language state
 * - Language switching function
 * - Translated text accessors
 * 
 * Also updates the HTML lang attribute when language changes.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to French
  const [language, setLanguageState] = useState<Language>('fr');

  /**
   * Updates the active language and HTML lang attribute
   */
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  // Get translations for current language
  const t = translations[language] as TranslationType;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * useLanguage - Hook to access language context
 * 
 * Provides access to current language state and translations.
 * Must be used within a LanguageProvider.
 * 
 * @returns Object containing language, setLanguage function, and translations
 * @throws Error if used outside of LanguageProvider
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
