/**
 * ModifyContractForm Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ModifyContractForm } from '@/components/forms/ModifyContractForm';

describe('ModifyContractForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders contract details section', () => {
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/détails du contrat/i)).toBeInTheDocument();
    });

    it('renders personal information section', () => {
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/informations personnelles/i)).toBeInTheDocument();
    });

    it('renders modification reason section', () => {
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Check for the section header
      expect(screen.getByText(/motif de la modification/i)).toBeInTheDocument();
    });

    it('renders modification reason options', () => {
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Check for "Changement de formule" (exact French translation)
      expect(screen.getByText(/changement de formule/i)).toBeInTheDocument();
    });

    it('renders submit and back buttons', () => {
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByRole('button', { name: /soumettre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /retour/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('can select modification reason', async () => {
      const user = userEvent.setup();
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Click on "Changement de formule" option
      const changeFormulaOption = screen.getByText(/changement de formule/i);
      await user.click(changeFormulaOption);

      // The option should be visually selected
      expect(changeFormulaOption.closest('button')).toHaveClass('border-primary/50');
    });

    it('can type in contract number field', async () => {
      const user = userEvent.setup();
      render(<ModifyContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Find contract number input
      const contractInput = document.querySelector('input[name="contractNumber"]') as HTMLInputElement;
      expect(contractInput).not.toBeNull();

      await user.type(contractInput, 'CTR-12345');
      expect(contractInput.value).toBe('CTR-12345');
    });
  });
});
