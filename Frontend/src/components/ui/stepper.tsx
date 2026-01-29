/**
 * Stepper Component
 * 
 * Visual stepper component for multi-step forms.
 * Shows progress through numbered steps.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: Array<{ number: number; label: string }>;
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  index < currentStep
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground border border-border'
                )}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              <label className="text-xs font-medium text-center mt-2 px-1 text-foreground">
                {step.label}
              </label>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 mb-6">
                <div
                  className={cn(
                    'h-full transition-all',
                    index < currentStep ? 'bg-green-600' : 'bg-muted'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
