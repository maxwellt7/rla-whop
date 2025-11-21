import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_STORAGE_KEY = 'whop_token';
const USER_STORAGE_KEY = 'whop_user';
const TOKEN_PARAM_KEYS = ['whopToken', 'whop_token', 'whopUserToken', 'userToken', 'token'];

declare global {
  interface Window {
    whop?: any;
    __WHOP_DEV_PROXY__?: { token?: string };
    __WHOP_CONTEXT__?: { userToken?: string };
  }
}

// Whop-specific API service
export class WhopAuthService {
  private static instance: WhopAuthService;
  private token: string | null = null;
  private user: any = null;
  private messageListenerAttached = false;

  static getInstance(): WhopAuthService {
    if (!WhopAuthService.instance) {
      WhopAuthService.instance = new WhopAuthService();
    }
    return WhopAuthService.instance;
  }

  // Try to pull a token from Whop runtime context (query params, postMessage, etc)
  syncTokenFromEnvironment(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    this.attachMessageListener();
    const detectedToken = this.detectTokenFromEnvironment();

    if (detectedToken) {
      this.setToken(detectedToken);
      return detectedToken;
    }

    return null;
  }

  private attachMessageListener() {
    if (this.messageListenerAttached || typeof window === 'undefined') {
      return;
    }

    window.addEventListener('message', this.handleTokenMessage);
    this.messageListenerAttached = true;
  }

  private handleTokenMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== 'object') {
      return;
    }

    const token =
      data.whopToken ||
      data.whopUserToken ||
      data.userToken ||
      data.token ||
      data?.payload?.whopToken ||
      data?.payload?.token;

    if (typeof token === 'string' && token.trim()) {
      this.setToken(token.trim());
    }

    const subscriptionTier = data.subscriptionTier || data?.payload?.subscriptionTier;
    if (subscriptionTier && typeof subscriptionTier === 'string') {
      sessionStorage.setItem('whop_subscription_tier', subscriptionTier.toLowerCase());
    }
  };

  private detectTokenFromEnvironment(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const fromQuery = this.extractTokenFromParams(window.location.search);
    if (fromQuery) {
      this.stripTokenFromUrl();
      return fromQuery;
    }

    const fromHash = this.extractTokenFromParams(window.location.hash?.replace(/^#/, ''));
    if (fromHash) {
      return fromHash;
    }

    const globalCandidate = this.extractTokenFromWindow();
    if (globalCandidate) {
      return globalCandidate;
    }

    const storedTier = sessionStorage.getItem('whop_subscription_tier');
    if (storedTier) {
      // no-op, but keeps type checker happy if we decide to use it later
    }

    return null;
  }

  private extractTokenFromParams(search: string | null | undefined): string | null {
    if (!search) {
      return null;
    }

    const normalized = search.startsWith('?') ? search : `?${search}`;
    const params = new URLSearchParams(normalized);

    for (const key of TOKEN_PARAM_KEYS) {
      const value = params.get(key);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }

  private stripTokenFromUrl() {
    if (typeof window === 'undefined' || !window.history?.replaceState) {
      return;
    }

    const url = new URL(window.location.href);
    let mutated = false;

    TOKEN_PARAM_KEYS.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        mutated = true;
      }
    });

    if (mutated) {
      window.history.replaceState({}, document.title, url.toString());
    }
  }

  private extractTokenFromWindow(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const candidates = [
      window.whop?.userToken,
      window.whop?.user?.token,
      window.whop?.auth?.token,
      window.whop?.session?.token,
      window.whop?.context?.token,
      window.__WHOP_DEV_PROXY__?.token,
      window.__WHOP_CONTEXT__?.userToken,
      (window as any).WHOP_USER_TOKEN,
      (window as any).__WHOP_USER_TOKEN__,
      (window as any).__whop?.token,
      (window as any).__whop?.userToken,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return null;
  }

  // Initialize with Whop token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  // Get stored token
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
    }
    return this.token;
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('whop_subscription_tier');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get user profile from Whop
  async getUserProfile() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-whop-user-token': token,
          'Content-Type': 'application/json',
        },
      });

      this.user = response.data.data;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  // Get authorization URL for Whop OAuth
  async getAuthUrl() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/whop`);
      return response.data.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw error;
    }
  }

  // Handle OAuth callback
  async handleCallback(code: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/callback`, {
        code,
        redirectUri: window.location.origin + '/auth/callback'
      });

      const { token, user } = response.data;
      this.setToken(token);
      this.user = user;
      
      return { token, user };
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const whopAuth = WhopAuthService.getInstance();

// Enhanced API client with Whop authentication
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Add request interceptor to include Whop token
api.interceptors.request.use(
  (config) => {
    const token = whopAuth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-whop-user-token'] = token;
    }
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      authenticated: !!token,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      whopAuth.clearAuth();
    }

    return Promise.reject(error);
  }
);

export default api;
