'use client';

import React, { createContext, useContext, useState } from 'react';

// Simplified user interface
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User;
  loading: boolean;
}

// Create a default user
const defaultUser: User = {
  id: '123456',
  name: 'Demo User',
  email: 'user@example.com',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always use the default user
  const [user] = useState<User>(defaultUser);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 