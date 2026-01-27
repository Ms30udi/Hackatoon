/**
 * FormInput Component
 * 
 * Reusable text input field with label, helper text, and error display.
 * Follows the institutional design system styling.
 * 
 * @module components/FormInput
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input field label text */
  label: string;
  /** Optional helper text displayed below input */
  helper?: string;
  /** Error message to display (replaces helper when present) */
  error?: string;
}

/**
 * FormInput - Styled text input with label and validation
 * 
 * Features:
 * - Automatic ID generation from label text
 * - Required field indicator (asterisk)
 * - Helper text support
 * - Error state styling and message display
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  helper,
  error,
  className,
  id,
  ...props
}) => {
  // Generate unique ID from label if not provided
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {/* Label with required indicator */}
      <label htmlFor={inputId} className="input-label">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Input field */}
      <input
        id={inputId}
        className={cn(
          'input-institutional',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      />

      {/* Helper or error text */}
      {helper && !error && <p className="input-helper">{helper}</p>}
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};
