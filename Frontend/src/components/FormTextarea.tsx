/**
 * FormTextarea Component
 * 
 * Reusable multi-line text area with label, helper text, and error display.
 * Supports vertical resizing by default.
 * 
 * @module components/FormTextarea
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea field label text */
  label: string;
  /** Optional helper text displayed below textarea */
  helper?: string;
  /** Error message to display (replaces helper when present) */
  error?: string;
}

/**
 * FormTextarea - Styled multi-line text input with label and validation
 * 
 * Features:
 * - Automatic ID generation from label text
 * - Required field indicator (asterisk)
 * - Helper text support
 * - Error state styling and message display
 * - Resizable with minimum height
 */
export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  helper,
  error,
  className,
  id,
  ...props
}) => {
  // Generate unique ID from label if not provided
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {/* Label with required indicator */}
      <label htmlFor={textareaId} className="input-label">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Textarea field */}
      <textarea
        id={textareaId}
        className={cn(
          'input-institutional min-h-[120px] resize-y',
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
