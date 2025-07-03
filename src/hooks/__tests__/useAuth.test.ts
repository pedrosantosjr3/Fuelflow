import {renderHook, act} from '@testing-library/react-native';
import {useAuth} from '../useAuth';
import {authService, userService} from '@/services/firebase';

// Mock Firebase services
jest.mock('@/services/firebase', () => ({
  authService: {
    onAuthStateChanged: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  },
  userService: {
    getUser: jest.fn(),
    createUser: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockAuthService.onAuthStateChanged.mockReturnValue(() => {});
    
    const {result} = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful login', async () => {
    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
    };
    
    const mockUserData = {
      userId: 'user123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      addresses: [],
      vehicles: [],
      paymentMethods: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.signIn.mockResolvedValue(mockUser as any);
    mockUserService.getUser.mockResolvedValue(mockUserData);
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const {result} = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result.current.error).toBe(null);
  });

  it('should handle login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.signIn.mockRejectedValue(new Error(errorMessage));
    mockAuthService.onAuthStateChanged.mockReturnValue(() => {});

    const {result} = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle successful registration', async () => {
    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
    };

    mockAuthService.signUp.mockResolvedValue(mockUser as any);
    mockUserService.createUser.mockResolvedValue(undefined);
    mockAuthService.onAuthStateChanged.mockReturnValue(() => {});

    const {result} = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    expect(mockAuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockUserService.createUser).toHaveBeenCalledWith('user123', {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      addresses: [],
      vehicles: [],
      paymentMethods: [],
    });
    expect(result.current.error).toBe(null);
  });

  it('should handle logout', async () => {
    mockAuthService.signOut.mockResolvedValue(undefined);
    mockAuthService.onAuthStateChanged.mockReturnValue(() => {});

    const {result} = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthService.signOut).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
  });

  it('should handle password reset', async () => {
    mockAuthService.resetPassword.mockResolvedValue(undefined);
    mockAuthService.onAuthStateChanged.mockReturnValue(() => {});

    const {result} = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    expect(result.current.error).toBe(null);
  });

  it('should handle auth state changes', async () => {
    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
    };
    
    const mockUserData = {
      userId: 'user123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      addresses: [],
      vehicles: [],
      paymentMethods: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserService.getUser.mockResolvedValue(mockUserData);
    
    let authCallback: (user: any) => void;
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return () => {};
    });

    const {result} = renderHook(() => useAuth());

    // Simulate user login
    await act(async () => {
      authCallback(mockUser);
    });

    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockUserService.getUser).toHaveBeenCalledWith('user123');
    expect(result.current.user).toEqual(mockUserData);
    expect(result.current.loading).toBe(false);
  });

  it('should handle auth state change with null user', async () => {
    let authCallback: (user: any) => void;
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return () => {};
    });

    const {result} = renderHook(() => useAuth());

    // Simulate user logout
    await act(async () => {
      authCallback(null);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });
});