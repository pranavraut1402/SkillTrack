import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signInAsDemoOfficer: (officerName?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to Firebase Auth state persistence
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state listener error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let message = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled: The Google sign-in window was closed.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please allow popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in in progress or previous popup was cancelled.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw err;
    }
  };

  const signInAsDemoOfficer = async (
    officerName = 'Dr. Rajesh Shinde (Director)'
  ): Promise<User | null> => {
    setAuthError(null);
    try {
      const result = await signInAnonymously(auth);
      if (result.user && !result.user.displayName) {
        await updateProfile(result.user, {
          displayName: officerName,
          photoURL:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBOSeOGLl5Gpt2MK1lUze0YOgLhb7833Qu8uGHKb3Yna4Rq46Yp5hplo_iY5ByDwVCJ03QMATkq-UnhCpoNvYC9XDKeTFe5mIbjP_RZN4Cgl2Phzv_ni-A649-cCrkKu_IUW3lzAd0r0w4_x56zANaSqh3S2EiulV4bV2O6sUeWiSLVhsDneiV27RHeTVa07YfB5rGEDi-J--M6n6-8AUGuc6iNNKIvCCOthhqKDSI0KvVjzuhLjBHB'
        });
      }
      setUser(auth.currentUser);
      return auth.currentUser;
    } catch (err: any) {
      console.error('Demo officer sign-in error:', err);
      setAuthError(err.message || 'Failed to sign in with Demo Officer mode.');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        signInWithGoogle,
        signInAsDemoOfficer,
        logout,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
