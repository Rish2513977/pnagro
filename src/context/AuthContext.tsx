import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { User } from '../types';
import { api } from '../services/api';
import { auth, googleAuthProvider, facebookAuthProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    location?: { state: string; district: string; pincode?: string };
  }) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook', role: 'farmer' | 'owner') => Promise<void>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pnagro_token'));
  const [loading, setLoading] = useState(true);

  // Check current user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('pnagro_token');
      const savedCustomProfile = localStorage.getItem('pnagro_custom_user');
      if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
        try {
          const res = await api.getMe();
          let userData = res.user;
          if (savedCustomProfile) {
            try {
              const parsed = JSON.parse(savedCustomProfile);
              if (parsed._id === userData._id) {
                userData = { ...userData, ...parsed };
              }
            } catch (e) {}
          }
          setUser(userData);
        } catch {
          // Token is expired, invalid or from an older session - cleanly reset state
          localStorage.removeItem('pnagro_token');
          localStorage.removeItem('pnagro_custom_user');
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem('pnagro_token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      const res = await api.login({ email: emailOrPhone, password });
      localStorage.setItem('pnagro_token', res.token);
      setToken(res.token);
      const savedCustomProfile = localStorage.getItem('pnagro_custom_user');
      let userData = res.user;
      if (savedCustomProfile) {
        try {
          const parsed = JSON.parse(savedCustomProfile);
          if (parsed._id === userData._id || parsed.email === userData.email) {
            userData = { ...userData, ...parsed };
          }
        } catch (e) {}
      }
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.message || 'Invalid credentials. Please verify your email or phone number and password.');
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    location?: { state: string; district: string; pincode?: string };
  }) => {
    try {
      const res = await api.register(userData);
      localStorage.setItem('pnagro_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed. Please check the details entered.');
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook', role: 'farmer' | 'owner') => {
    try {
      const authProvider = provider === 'google' ? googleAuthProvider : facebookAuthProvider;
      const userCredential = await signInWithPopup(auth, authProvider);
      const fbUser = userCredential.user;

      // Extract email or fallback to verified provider handle if user hid email
      const email =
        fbUser.email ||
        fbUser.providerData?.find((p) => p.email)?.email ||
        (provider === 'facebook'
          ? `fb_${fbUser.uid.slice(0, 12).toLowerCase()}@facebook.pnagro.in`
          : `google_${fbUser.uid.slice(0, 12).toLowerCase()}@google.pnagro.in`);

      const displayName =
        fbUser.displayName ||
        fbUser.providerData?.find((p) => p.displayName)?.displayName ||
        (provider === 'google' ? 'Google User' : 'Facebook User');

      const photo =
        fbUser.photoURL ||
        fbUser.providerData?.find((p) => p.photoURL)?.photoURL ||
        (provider === 'facebook'
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
          : undefined);

      const res = await api.socialLogin({
        email,
        name: displayName,
        avatar: photo,
        phone: fbUser.phoneNumber || undefined,
        role: role,
        provider: provider,
        firebaseUid: fbUser.uid,
      });

      localStorage.setItem('pnagro_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      console.error('Social login error:', err);
      let friendlyMessage = `${provider === 'google' ? 'Google' : 'Facebook'} sign-in could not be completed. Please try again.`;

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/user-cancelled') {
        friendlyMessage = `${provider === 'google' ? 'Google' : 'Facebook'} sign-in was cancelled.`;
      } else if (err.code === 'auth/popup-blocked') {
        friendlyMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyMessage = 'This domain is not in Firebase Auth Authorized Domains. Please add this domain in Firebase Console > Authentication > Settings > Authorized domains.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        friendlyMessage = 'An account already exists with this email address. Please sign in using your existing email/password or Google account.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = `Facebook login is not enabled in your Firebase Console. In Firebase Console > Authentication > Sign-in method, click Facebook, toggle Enable, and enter your Meta App ID & App Secret.`;
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-api-key') {
        friendlyMessage = 'Invalid Facebook credentials. Please verify your Facebook App ID and App Secret in Firebase Authentication.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network connection failed. Please check your internet connection.';
      } else if (err.message && !err.message.includes('Firebase:')) {
        friendlyMessage = err.message;
      }

      throw new Error(friendlyMessage);
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('pnagro_custom_user', JSON.stringify(merged));
  };

  const logout = () => {
    try {
      fbSignOut(auth).catch(() => {});
    } catch (e) {}
    localStorage.removeItem('pnagro_token');
    localStorage.removeItem('pnagro_custom_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
