import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmail as authSignIn,
  signOut as authSignOut,
  getAuthErrorMessage,
  getStoredToken,
} from '../Services/auth.service';
import type { AuthContextType } from '../Types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(getStoredToken() !== null);
    setIsLoading(false);
  }, []);

  async function signInWithEmail(email: string, password: string): Promise<void> {
    setError(null);
    try {
      await authSignIn(email, password);
      setIsAuthenticated(true);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(getAuthErrorMessage(code));
      throw err;
    }
  }

  async function signOut(): Promise<void> {
    await authSignOut();
    setIsAuthenticated(false);
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, error, signInWithEmail, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
