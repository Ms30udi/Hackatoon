/**
 * RequestTypeSelector Component
 * 
 * Interactive grid of service request type cards.
 * Users select one type to proceed with their request.
 * 
 * @module components/RequestTypeSelector
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { FileText, Settings, HelpCircle, Plug } from 'lucide-react';

/** Available request types in the system */
export type RequestType = 'newContract' | 'modifyContract' | 'information' | 'newConnection' | null;

interface RequestTypeSelectorProps {
  /** Currently selected request type */
  selected: RequestType;
  /** Callback when a type is selected */
  onSelect: (type: RequestType) => void;
}

/** Icon mapping for each request type */
const REQUEST_TYPE_ICONS = {
  newContract: FileText,
  modifyContract: Settings,
  information: HelpCircle,
  newConnection: Plug,
} as const;

/**
 * RequestTypeSelector - Service request type selection grid
 * 
 * Displays a responsive grid of selectable cards, each representing
 * a different type of service request. Features include:
 * - Visual icons for each type
 * - Localized titles and descriptions
 * - Clear selection state with checkmark indicator
 * - Smooth hover and selection animations
 */
export const RequestTypeSelector: React.FC<RequestTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { t } = useLanguage();

  // Build array of request types with their localized content
  const requestTypes: { key: RequestType; data: { title: string; description: string } }[] = [
    { key: 'newContract', data: t.requestTypes.newContract },
    { key: 'modifyContract', data: t.requestTypes.modifyContract },
    { key: 'information', data: t.requestTypes.information },
    { key: 'newConnection', data: t.requestTypes.newConnection },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requestTypes.map(({ key, data }) => {
        const Icon = REQUEST_TYPE_ICONS[key!];
        const isSelected = selected === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              'request-type-option text-left',
              isSelected && 'selected'
            )}
          >
            {/* Card Content */}
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div className={cn(
                'w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors duration-300',
                isSelected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
              )}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'text-base font-medium mb-1 transition-colors duration-300',
                  isSelected ? 'text-foreground' : 'text-foreground/80'
                )}>
                  {data.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              </div>
            </div>

            {/* Selection Indicator Checkbox */}
            <div className={cn(
              'absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300',
              isSelected
                ? 'border-accent bg-accent'
                : 'border-border bg-transparent'
            )}>
              {isSelected && (
                <svg className="w-full h-full text-accent-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
