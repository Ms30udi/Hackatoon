/**
 * FormSelect Component
 * 
 * Reusable dropdown select field with label, helper text, and error display.
 * Features custom chevron icon for consistent styling.
 * 
 * @module components/FormSelect
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Select field label text */
  label: string;
  /** Optional helper text displayed below select */
  helper?: string;
  /** Error message to display (replaces helper when present) */
  error?: string;
  /** Array of options for the dropdown */
  options: { value: string; label: string }[];
}

/**
 * FormSelect - Styled dropdown select with label and validation
 * 
 * Features:
 * - Automatic ID generation from label text
 * - Custom dropdown arrow icon
 * - Required field indicator (asterisk)
 * - Helper text support
 * - Error state styling and message display
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  helper,
  error,
  options,
  className,
  id,
  ...props
}) => {
  // Generate unique ID from label if not provided
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {/* Label with required indicator */}
      <label htmlFor={selectId} className="input-label">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Select wrapper for custom icon positioning */}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'input-institutional appearance-none pr-10 cursor-pointer',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            props.disabled && 'opacity-50 cursor-not-allowed bg-muted',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
          strokeWidth={1.5}
        />
      </div>

      {/* Helper or error text */}
      {helper && !error && <p className="input-helper">{helper}</p>}
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};
