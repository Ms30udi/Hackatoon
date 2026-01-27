/**
 * ContractTypeSelector Component
 * 
 * Selection control for choosing entity type when creating contracts.
 * Displays individual, household, and company options as selectable cards.
 * 
 * @module components/ContractTypeSelector
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { User, Users, Building2 } from 'lucide-react';

/** Available contract entity types */
export type ContractType = 'individual' | 'household' | 'company';

interface ContractTypeSelectorProps {
  /** Currently selected contract type */
  selected: ContractType;
  /** Callback when a type is selected */
  onSelect: (type: ContractType) => void;
}

/**
 * ContractTypeSelector - Entity type selection for contracts
 * 
 * Displays three selectable cards for different entity types:
 * - Individual: Single person contracts
 * - Household: Multi-occupant residential contracts
 * - Company: Business/corporate contracts
 * 
 * Each card shows an icon, label, and brief description.
 */
export const ContractTypeSelector: React.FC<ContractTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { t } = useLanguage();

  // Contract type definitions with icons and labels
  const contractTypes: { key: ContractType; label: string; desc: string; icon: typeof User }[] = [
    { key: 'individual', label: t.individual, desc: t.individualDesc, icon: User },
    { key: 'household', label: t.household, desc: t.householdDesc, icon: Users },
    { key: 'company', label: t.company, desc: t.companyDesc, icon: Building2 },
  ];

  return (
    <div className="space-y-2">
      <label className="input-label">{t.contractType}</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {contractTypes.map(({ key, label, desc, icon: Icon }) => {
          const isSelected = selected === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-sm border transition-all duration-300 text-left',
                isSelected
                  ? 'border-primary/50 bg-primary/[0.02]'
                  : 'border-border bg-card hover:border-primary/20'
              )}
            >
              {/* Type Icon */}
              <div className={cn(
                'w-9 h-9 rounded-sm flex items-center justify-center transition-colors duration-300',
                isSelected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
              )}>
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </div>

              {/* Type Label and Description */}
              <div className="min-w-0">
                <span className={cn(
                  'block text-sm font-medium transition-colors duration-300',
                  isSelected ? 'text-foreground' : 'text-foreground/80'
                )}>
                  {label}
                </span>
                <span className="block text-xs text-muted-foreground truncate">
                  {desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
