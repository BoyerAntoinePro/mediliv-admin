import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../Config/firebase.config';
import { signInWithEmail as authSignIn, signOut as authSignOut, getAuthErrorMessage } from '../Services/auth.service';
import type { AuthContextType } from '../Types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithEmail(email: string, password: string): Promise<void> {
    setError(null);
    try {
      await authSignIn(email, password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(getAuthErrorMessage(code));
      throw err;
    }
  }

  async function signOut(): Promise<void> {
    await authSignOut();
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        error,
        signInWithEmail,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
