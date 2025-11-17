import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'admin' | null;

interface User {
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_USERS = [
  {
    email: 'admin@kelurahan.com',
    password: 'admin123',
    name: 'Admin Kelurahan',
    role: 'admin' as const,
  },
  {
    email: 'user@example.com',
    password: 'user123',
    name: 'Mahasiswa User',
    role: 'user' as const,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser({
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
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
