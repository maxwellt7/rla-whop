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
    whopAuth.syncTokenFromEnvironment();
    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAuth = async () => {
    try {
      let token = whopAuth.getToken();

      if (!token) {
        token = whopAuth.syncTokenFromEnvironment();
      }

      if (!token && !isRunningInsideWhop()) {
        whopAuth.setToken('dev-token');
        token = 'dev-token';
      }

      if (token) {
        try {
          const userProfile = await whopAuth.getUserProfile();
          const tier = (userProfile.subscriptionTier as 'free' | 'pro' | 'enterprise') || getFallbackTier();
          const allowedRateLimit = userProfile.rateLimit || getRateLimitForTier(tier);

          setUser(userProfile.user);
          setSubscriptionTier(tier);
          setRateLimit(allowedRateLimit);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          setFallbackUser();
        }
      } else {
        setFallbackUser();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setFallbackUser();
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
      
      const token = whopAuth.syncTokenFromEnvironment();
      if (token) {
        await initializeAuth();
        return;
      }

      console.warn('Not in Whop environment - allowing access for development');
      const fallbackTier = getFallbackTier();
      setUser({ id: 'dev-user', name: 'Development User' });
      whopAuth.setToken('dev-token');
      setSubscriptionTier(fallbackTier);
      setRateLimit(getRateLimitForTier(fallbackTier));
    } catch (error) {
      console.error('Failed to authenticate:', error);
    }
  };

  const logout = () => {
    whopAuth.clearAuth();
    setUser(null);
    const fallbackTier = getFallbackTier();
    setSubscriptionTier(fallbackTier);
    setRateLimit(getRateLimitForTier(fallbackTier));
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

  const isRunningInsideWhop = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!window.whop || window.self !== window.top;
  };

  const getFallbackTier = (): 'free' | 'pro' | 'enterprise' => {
    if (typeof sessionStorage !== 'undefined') {
      const storedTier = sessionStorage.getItem('whop_subscription_tier');
      if (storedTier === 'free' || storedTier === 'pro' || storedTier === 'enterprise') {
        return storedTier;
      }
    }
    return 'pro';
  };

  const getRateLimitForTier = (tier: 'free' | 'pro' | 'enterprise') => {
    switch (tier) {
      case 'enterprise':
        return 200;
      case 'pro':
        return 50;
      default:
        return 5;
    }
  };

  const setFallbackUser = () => {
    const fallbackTier = getFallbackTier();
    setUser({ id: 'whop-user', name: 'Whop User' });
    setSubscriptionTier(fallbackTier);
    setRateLimit(getRateLimitForTier(fallbackTier));
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
