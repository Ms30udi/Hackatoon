/**
 * Technical Mappings Module
 * 
 * Automatically defines technical field values based on the contract type
 * to simplify the user experience (UX) and prevent technical data entry errors.
 */

export type ContractType = 'individual' | 'household' | 'company';

export interface TechnicalDefaults {
  meterType: string;
  phaseConfiguration: string;
  voltageLevel: string;
  subscribedPower: number;
}

/**
 * Default technical values mapped by contract type
 */
export const TECHNICAL_MAPPINGS: Record<ContractType, TechnicalDefaults> = {
  individual: {
    meterType: 'standard-mono',
    phaseConfiguration: '220V',
    voltageLevel: 'BT',
    subscribedPower: 6.6,
  },
  household: {
    meterType: 'standard-mono',
    phaseConfiguration: '220V',
    voltageLevel: 'BT',
    subscribedPower: 11.0,
  },
  company: {
    meterType: 'smart',
    phaseConfiguration: '380V',
    voltageLevel: 'BT',
    subscribedPower: 22.0,
  },
};

/**
 * Gets technical defaults for a given contract type
 */
export const getTechnicalDefaults = (type: ContractType): TechnicalDefaults => {
  return TECHNICAL_MAPPINGS[type] || TECHNICAL_MAPPINGS.individual;
};

/**
 * Backend API Base URL
 */
export const API_BASE_URL = 'http://localhost:8000';
