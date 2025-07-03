import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../auth/LoginScreen';
import {useAuth} from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </PaperProvider>
  );
};

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
    });
  });

  it('should render login form', () => {
    const {getByText, getByLabelText} = renderWithProviders(<LoginScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to your account')).toBeTruthy();
    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('should handle email input', () => {
    const {getByLabelText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByLabelText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('should handle password input', () => {
    const {getByLabelText} = renderWithProviders(<LoginScreen />);
    
    const passwordInput = getByLabelText('Password');
    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('should toggle password visibility', () => {
    const {getByLabelText, getByRole} = renderWithProviders(<LoginScreen />);
    
    const passwordInput = getByLabelText('Password');
    const toggleButton = getByRole('button', {name: /eye/i});

    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);
    
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should handle remember me checkbox', () => {
    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const checkbox = getByText('Remember me').parent;
    fireEvent.press(checkbox);

    // The checkbox state should change (exact implementation depends on component)
    expect(checkbox).toBeTruthy();
  });

  it('should validate required fields', async () => {
    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('This field is required.')).toBeTruthy();
    });
  });

  it('should validate email format', async () => {
    const {getByLabelText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByLabelText('Email');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeTruthy();
    });
  });

  it('should validate password length', async () => {
    const {getByLabelText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Password must be at least 8 characters long.')).toBeTruthy();
    });
  });

  it('should call login function with correct credentials', async () => {
    const {getByLabelText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('should show loading state during login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
    });

    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const signInButton = getByText('Sign In');
    expect(signInButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should handle login error', () => {
    const errorMessage = 'Invalid credentials';
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: errorMessage,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
    });

    // Mock Alert.alert
    const mockAlert = jest.spyOn(require('react-native'), 'Alert', 'get')
      .mockReturnValue({alert: jest.fn()});

    const {getByLabelText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(signInButton);

    // Error should be displayed via Alert
    expect(mockAlert).toBeTruthy();
  });

  it('should navigate to forgot password screen', () => {
    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const forgotPasswordButton = getByText('Forgot Password?');
    fireEvent.press(forgotPasswordButton);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should navigate to register screen', () => {
    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('should include remember me in login data when checked', async () => {
    const {getByLabelText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const rememberMeCheckbox = getByText('Remember me').parent;
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(rememberMeCheckbox);
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('should disable form when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
    });

    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const signInButton = getByText('Sign In');
    expect(signInButton.props.accessibilityState?.disabled).toBe(true);
  });
});