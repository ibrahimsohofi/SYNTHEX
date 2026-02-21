import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authAPI, setAuthToken, getAuthToken, type User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'synthex_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  // Check if user is still authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setInitialCheckDone(true);
        return;
      }

      try {
        const response = await authAPI.me();
        setUser(response.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
      } catch {
        // Token is invalid, clear it
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (!email || !password) {
        setError('Email and password are required');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      // Call the real API
      const result = await authAPI.login(email, password);

      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during login';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (!name || !email || !password) {
        setError('All fields are required');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return false;
      }

      // Call the real API
      const result = await authAPI.signup(name, email, password);

      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar?: string }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authAPI.updateProfile(data);
      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isLoading || !initialCheckDone,
        login,
        signup,
        logout,
        error,
        clearError,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
