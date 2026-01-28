/**
 * NewConnectionForm Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { NewConnectionForm } from '@/components/forms/NewConnectionForm';

describe('NewConnectionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with contract type selector', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Check for "Particulier" type (individual in French)
      expect(screen.getByText('Particulier')).toBeInTheDocument();
    });

    it('renders personal info section', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/informations personnelles/i)).toBeInTheDocument();
    });

    it('renders connection info section', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/informations de raccordement/i)).toBeInTheDocument();
    });

    it('renders property type options', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/construction neuve/i)).toBeInTheDocument();
      expect(screen.getByText(/bâtiment existant/i)).toBeInTheDocument();
    });

    it('renders submit and back buttons', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByRole('button', { name: /soumettre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    });

    it('renders procedure steps panel', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/étapes de la procédure/i)).toBeInTheDocument();
    });

    it('renders required documents panel', () => {
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/documents requis/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /retour/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('allows selecting property type', async () => {
      const user = userEvent.setup();
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Click on existing building
      const existingBuildingOption = screen.getByText(/bâtiment existant/i);
      await user.click(existingBuildingOption);

      // Button should now have the selected styling
      expect(existingBuildingOption.closest('button')).toHaveClass('border-primary/50');
    });

    it('shows company fields when company type selected', async () => {
      const user = userEvent.setup();
      render(<NewConnectionForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Click on company type
      const companyOption = screen.getByText('Entreprise');
      await user.click(companyOption);

      // Should show company info section (use exact text)
      await waitFor(() => {
        expect(screen.getByText(/informations de l'entreprise/i)).toBeInTheDocument();
      });
    });
  });
});
