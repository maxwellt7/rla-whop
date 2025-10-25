import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Whop-specific API service
export class WhopAuthService {
  private static instance: WhopAuthService;
  private token: string | null = null;
  private user: any = null;

  static getInstance(): WhopAuthService {
    if (!WhopAuthService.instance) {
      WhopAuthService.instance = new WhopAuthService();
    }
    return WhopAuthService.instance;
  }

  // Initialize with Whop token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('whop_token', token);
  }

  // Get stored token
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('whop_token');
    }
    return this.token;
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('whop_token');
    localStorage.removeItem('whop_user');
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
          'Content-Type': 'application/json',
        },
      });

      this.user = response.data.data;
      localStorage.setItem('whop_user', JSON.stringify(this.user));
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
      // In a real implementation, you'd exchange the code for a token
      // For now, we'll simulate this process
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
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default api;
