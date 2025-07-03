import { useState, useEffect, useCallback } from 'react';
import { authService, userService } from '@/services/firebase';
import { User, LoginForm, RegisterForm, UseAuthReturn } from '@/types';
import { ERROR_MESSAGES } from '@/constants';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userData = await userService.getUser(firebaseUser.uid);
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(ERROR_MESSAGES.GENERIC_ERROR);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginForm) => {
    try {
      setLoading(true);
      setError(null);

      const firebaseUser = await authService.signIn(credentials.email, credentials.password);
      
      // User data will be set by the auth state change listener
      // No need to manually set user here
      
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);

      // Create Firebase user
      const firebaseUser = await authService.signUp(userData.email, userData.password);
      
      // Create user document in Firestore
      const userDoc: Partial<User> = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        addresses: [],
        vehicles: [],
        paymentMethods: [],
      };

      await userService.createUser(firebaseUser.uid, userDoc);
      
      // User data will be set by the auth state change listener
      
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.signOut();
      setUser(null);
      
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
  };
};