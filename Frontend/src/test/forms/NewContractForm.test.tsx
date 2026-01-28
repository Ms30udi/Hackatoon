/**
 * NewContractForm Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { NewContractForm } from '@/components/forms/NewContractForm';

describe('NewContractForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with contract type selector', () => {
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Check for "Particulier" type (individual in French)
      expect(screen.getByText('Particulier')).toBeInTheDocument();
    });

    it('renders personal info section', () => {
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/informations personnelles/i)).toBeInTheDocument();
    });

    it('renders address section', () => {
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Using exact text from translation: "Adresse du lieu"
      expect(screen.getByText(/adresse du lieu/i)).toBeInTheDocument();
    });

    it('renders submit and back buttons', () => {
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByRole('button', { name: /soumettre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    });

    it('renders required documents panel', () => {
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/documents requis/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /retour/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('allows selecting company type', async () => {
      const user = userEvent.setup();
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Click on company type
      const companyOption = screen.getByText('Entreprise');
      await user.click(companyOption);

      // Should show company info section (use exact text)
      await waitFor(() => {
        expect(screen.getByText(/informations de l'entreprise/i)).toBeInTheDocument();
      });
    });

    it('can type in CIN field', async () => {
      const user = userEvent.setup();
      render(<NewContractForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Find CIN input by name attribute
      const cinInput = document.querySelector('input[name="cin"]') as HTMLInputElement;
      expect(cinInput).not.toBeNull();

      await user.type(cinInput, 'AB123456');
      expect(cinInput.value).toBe('AB123456');
    });
  });
});
