import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { authAPI, getCurrentUser, isAuthenticated as checkAuth } from '../services/api';

export type UserRole = 'user' | 'admin' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{success: boolean, requiresVerification?: boolean}>;
  logout: () => void;
  verifyOTP: (email: string, otpCode: string) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout configuration (30 minutes = 1800000 ms)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        if (checkAuth()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      
      setError(response.message || 'Login gagal');
      return false;
    } catch (err: any) {
      const errorMsg = err.message || 'Terjadi kesalahan saat login';
      setError(errorMsg);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    phone?: string
  ): Promise<{success: boolean, requiresVerification?: boolean}> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register({ name, email, password, phone });
      
      if (response.success) {
        // Jika memerlukan verifikasi OTP, jangan set user
        if (response.data?.requiresVerification) {
          return { success: true, requiresVerification: true };
        }
        
        // Jika langsung verified (dari overwrite), set user
        if (response.data?.user) {
          setUser(response.data.user);
        }
        return { success: true, requiresVerification: false };
      }
      
      setError(response.message || 'Registrasi gagal');
      return { success: false };
    } catch (err: any) {
      const errorMsg = err.message || 'Terjadi kesalahan saat registrasi';
      setError(errorMsg);
      console.error('Register error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
    
    // Clear timeout when logout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const verifyOTP = async (email: string, otpCode: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.verifyOTP({ email, otpCode });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      
      setError(response.message || 'Verifikasi OTP gagal');
      return false;
    } catch (err: any) {
      const errorMsg = err.message || 'Terjadi kesalahan saat verifikasi OTP';
      setError(errorMsg);
      console.error('Verify OTP error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.resendOTP({ email });
      
      if (response.success) {
        return true;
      }
      
      setError(response.message || 'Pengiriman ulang OTP gagal');
      return false;
    } catch (err: any) {
      const errorMsg = err.message || 'Terjadi kesalahan saat mengirim ulang OTP';
      setError(errorMsg);
      console.error('Resend OTP error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function untuk reset activity timeout
  const resetActivityTimeout = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hanya set timeout jika user sudah login
    if (user) {
      timeoutRef.current = setTimeout(() => {
        console.log('Session expired due to inactivity');
        logout();
      }, SESSION_TIMEOUT);
    }
  };

  // Setup activity tracking
  useEffect(() => {
    if (!user) return;

    // Activity events untuk track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetActivityTimeout();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Set initial timeout
    resetActivityTimeout();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    verifyOTP,
    resendOTP,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
