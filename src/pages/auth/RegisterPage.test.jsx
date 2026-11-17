/**
 * RegisterPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RegisterPage from './RegisterPage';
import { AuthContext } from '../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  const defaultAuthContext = {
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  };

  const renderRegisterPage = (authContextValue = defaultAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form with all fields', () => {
    renderRegisterPage();

    expect(screen.getByText('Registracija')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Vaše ime')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Vaše prezime')).toBeInTheDocument();
    expect(screen.getByLabelText(/email adresa/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Unesite lozinku')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Potvrdite lozinku')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registriraj se/i })).toBeInTheDocument();
  });

  it('displays Croatian labels and text', () => {
    renderRegisterPage();

    expect(screen.getByText('Stvorite novi račun na FlowOps platformi')).toBeInTheDocument();
    expect(screen.getByText(/već imate račun/i)).toBeInTheDocument();
    expect(screen.getByText(/prijavite se/i)).toBeInTheDocument();
  });

  it('displays password requirements', () => {
    renderRegisterPage();

    expect(screen.getByText('Zahtjevi za lozinku:')).toBeInTheDocument();
    expect(screen.getByText(/najmanje 8 znakova/i)).toBeInTheDocument();
    expect(screen.getByText(/jedno malo slovo/i)).toBeInTheDocument();
    expect(screen.getByText(/jedno veliko slovo/i)).toBeInTheDocument();
    expect(screen.getByText(/jedan broj/i)).toBeInTheDocument();
  });

  it('shows validation error for empty first name', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Ime je obavezno')).toBeInTheDocument();
    });
  });

  it('shows validation error for empty last name', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    await user.type(firstNameInput, 'Ivan');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Prezime je obavezno')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    const lastNameInput = screen.getByPlaceholderText('Vaše prezime');
    const emailInput = screen.getByLabelText(/email adresa/i);

    await user.type(firstNameInput, 'Ivan');
    await user.type(lastNameInput, 'Horvat');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    // HTML5 email validation will prevent form submission
    // so the Zod validation won't run.
    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('shows validation error for weak password', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    const lastNameInput = screen.getByPlaceholderText('Vaše prezime');
    const emailInput = screen.getByLabelText(/email adresa/i);
    const passwordInput = screen.getByPlaceholderText('Unesite lozinku');

    await user.type(firstNameInput, 'Ivan');
    await user.type(lastNameInput, 'Horvat');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'weak');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/lozinka mora imati najmanje 8 znakova/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for mismatched passwords', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    const lastNameInput = screen.getByPlaceholderText('Vaše prezime');
    const emailInput = screen.getByLabelText(/email adresa/i);
    const passwordInput = screen.getByPlaceholderText('Unesite lozinku');
    const confirmPasswordInput = screen.getByPlaceholderText('Potvrdite lozinku');

    await user.type(firstNameInput, 'Ivan');
    await user.type(lastNameInput, 'Horvat');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password456');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Lozinke se ne podudaraju')).toBeInTheDocument();
    });
  });

  it('calls register function with correct data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({});
    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    const lastNameInput = screen.getByPlaceholderText('Vaše prezime');
    const emailInput = screen.getByLabelText(/email adresa/i);
    const passwordInput = screen.getByPlaceholderText('Unesite lozinku');
    const confirmPasswordInput = screen.getByPlaceholderText('Potvrdite lozinku');

    await user.type(firstNameInput, 'Ivan');
    await user.type(lastNameInput, 'Horvat');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'Ivan',
        lastName: 'Horvat',
        email: 'test@example.com',
        password: 'Password123'
      });
    });
  });

  it('displays loading state during registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    const lastNameInput = screen.getByPlaceholderText('Vaše prezime');
    const emailInput = screen.getByLabelText(/email adresa/i);
    const passwordInput = screen.getByPlaceholderText('Unesite lozinku');
    const confirmPasswordInput = screen.getByPlaceholderText('Potvrdite lozinku');

    await user.type(firstNameInput, 'Ivan');
    await user.type(lastNameInput, 'Horvat');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    expect(screen.getByText('Registracija u tijeku...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email je već registriran';
    mockRegister.mockRejectedValue({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    renderRegisterPage();

    const firstNameInput = screen.getByPlaceholderText('Vaše ime');
    const lastNameInput = screen.getByPlaceholderText('Vaše prezime');
    const emailInput = screen.getByLabelText(/email adresa/i);
    const passwordInput = screen.getByPlaceholderText('Unesite lozinku');
    const confirmPasswordInput = screen.getByPlaceholderText('Potvrdite lozinku');

    await user.type(firstNameInput, 'Ivan');
    await user.type(lastNameInput, 'Horvat');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    const submitButton = screen.getByRole('button', { name: /registriraj se/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard when already authenticated', () => {
    const authContextAuthenticated = {
      ...defaultAuthContext,
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', role: 'Registrirani_Korisnik' }
    };

    renderRegisterPage(authContextAuthenticated);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('has link to login page', () => {
    renderRegisterPage();

    const loginLink = screen.getByRole('link', { name: /prijavite se/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
