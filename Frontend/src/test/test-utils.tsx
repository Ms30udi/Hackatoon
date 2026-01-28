/**
 * Test Utilities
 *
 * Provides testing utilities including:
 * - Custom render with providers
 * - Language context wrapper
 * - Common test helpers
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <LanguageProvider>
        {children}
      </LanguageProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

/**
 * Sample form data for testing
 */
export const mockFormData = {
  newContract: {
    cin: 'AB123456',
    firstName: 'Ahmed',
    lastName: 'Bennani',
    email: 'ahmed@test.com',
    phone: '+212600000001',
    address: '123 Avenue Mohammed V',
    city: 'Casablanca',
    postalCode: '20000',
    contractType: 'individual',
    startDate: '2026-02-01',
  },
  newConnection: {
    cin: 'CD789012',
    firstName: 'Fatima',
    lastName: 'Alaoui',
    email: 'fatima@test.com',
    phone: '+212600000002',
    connectionAddress: '456 Rue Hassan II',
    connectionCity: 'Rabat',
    connectionPostalCode: '10000',
    propertyType: 'apartment',
  },
  modifyContract: {
    contractNumber: 'CTR-12345678',
    cin: 'EF345678',
    firstName: 'Karim',
    lastName: 'Idrissi',
    email: 'karim@test.com',
    phone: '+212600000003',
    modificationReason: 'address_change',
    modificationDetails: 'Moving to new residence',
  },
  informationRequest: {
    firstName: 'Leila',
    lastName: 'Chakir',
    email: 'leila@test.com',
    phone: '+212600000004',
    subject: 'Tariff Information',
    message: 'I would like to know about current tariffs.',
  },
};
