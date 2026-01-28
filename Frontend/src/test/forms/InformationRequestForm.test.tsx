/**
 * InformationRequestForm Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { InformationRequestForm } from '@/components/forms/InformationRequestForm';

describe('InformationRequestForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders request type section', () => {
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/type de demande/i)).toBeInTheDocument();
    });

    it('renders request type options', () => {
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/demande d'information/i)).toBeInTheDocument();
    });

    it('renders personal info section', () => {
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByText(/informations personnelles/i)).toBeInTheDocument();
    });

    it('renders submit and back buttons', () => {
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByRole('button', { name: /soumettre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /retour/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('can switch to complaint type', async () => {
      const user = userEvent.setup();
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Find all buttons and get the one containing "Réclamation"
      const allButtons = screen.getAllByRole('button');
      const complaintButton = allButtons.find(btn =>
        btn.textContent?.includes('Réclamation')
      );

      if (complaintButton) {
        await user.click(complaintButton);
        expect(complaintButton).toHaveClass('border-primary/50');
      }
    });

    it('can type in subject field', async () => {
      const user = userEvent.setup();
      render(<InformationRequestForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      // Find subject input
      const subjectInput = document.querySelector('input[name="subject"]') as HTMLInputElement;
      expect(subjectInput).not.toBeNull();

      await user.type(subjectInput, 'Test Subject');
      expect(subjectInput.value).toBe('Test Subject');
    });
  });
});
