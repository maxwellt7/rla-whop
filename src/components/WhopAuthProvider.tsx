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
    // For Whop apps, authentication is automatic when loaded in Whop's iframe
    // We don't need to redirect anywhere - just authenticate the user
    console.log('Authenticating with Whop...');
    
    try {
      // Check if we're already in Whop environment
      if (window.whop) {
        console.log('Already in Whop environment');
        // User is already authenticated by Whop
        // No need to redirect
        return;
      }
      
      // If not in Whop, this is likely being accessed directly
      // For now, let's just bypass authentication for development
      // In production, this should only work within Whop's iframe
      console.warn('Not in Whop environment - allowing access for development');
      
      // Set a mock user for development
      setUser({ id: 'dev-user', name: 'Development User' });
      whopAuth.setToken('dev-token');
      
    } catch (error) {
      console.error('Failed to authenticate:', error);
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
