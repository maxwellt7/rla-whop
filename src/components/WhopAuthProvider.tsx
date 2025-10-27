import React, { useEffect, useState } from 'react';
import { whopAuth } from '../services/whopAuth';

interface WhopAuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  rateLimit: number;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const WhopAuthProvider: React.FC<WhopAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [rateLimit, setRateLimit] = useState(5);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (whopAuth.isAuthenticated()) {
        const userProfile = await whopAuth.getUserProfile();
        setUser(userProfile.user);
        setSubscriptionTier(userProfile.subscriptionTier);
        setRateLimit(userProfile.rateLimit);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      whopAuth.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const authUrl = await whopAuth.getAuthUrl();
      console.log('Auth URL received:', authUrl);
      
      if (!authUrl || authUrl === 'undefined') {
        console.error('Invalid auth URL received');
        // Fallback to direct Whop OAuth URL
        const clientId = 'app_RsMn7IKRAMfuhN';
        const redirectUri = window.location.origin + '/auth/callback';
        const fallbackUrl = `https://whop.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:users,write:users,read:payments,write:payments&response_type=code`;
        console.log('Using fallback URL:', fallbackUrl);
        window.location.href = fallbackUrl;
      } else {
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate login:', error);
      // Fallback to direct Whop OAuth URL
      const clientId = 'app_RsMn7IKRAMfuhN';
      const redirectUri = window.location.origin + '/auth/callback';
      const fallbackUrl = `https://whop.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:users,write:users,read:payments,write:payments&response_type=code`;
      window.location.href = fallbackUrl;
    }
  };

  const logout = () => {
    whopAuth.clearAuth();
    setUser(null);
    setSubscriptionTier('free');
    setRateLimit(5);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: whopAuth.isAuthenticated(),
    isLoading,
    login,
    logout,
    subscriptionTier,
    rateLimit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a WhopAuthProvider');
  }
  return context;
};
