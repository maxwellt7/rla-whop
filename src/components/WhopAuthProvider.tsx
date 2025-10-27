import React, { useEffect, useState } from 'react';
import { whopAuth } from '../services/whopAuth';

// Extend Window interface for Whop SDK
declare global {
  interface Window {
    whop?: any;
  }
}

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
    // For Whop apps, users authenticate through Whop's app system
    // The app will be opened in Whop's iframe/container
    // Users will be automatically authenticated when they access the app through Whop
    
    // Redirect to Whop app page with app ID
    const appUrl = `https://whop.com/app/${process.env.VITE_WHOP_APP_ID || 'app_RsMn7IKRAMfuhN'}`;
    console.log('Redirecting to Whop app:', appUrl);
    
    // Try to open in Whop
    try {
      // Check if we're in a Whop iframe
      if (window.whop) {
        // We're already in Whop, authentication should be automatic
        console.log('Already in Whop environment');
      } else {
        // Redirect to Whop app page
        window.location.href = appUrl;
      }
    } catch (error) {
      console.error('Failed to redirect to Whop:', error);
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
