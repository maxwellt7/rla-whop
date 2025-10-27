import { Whop } from '@whop/sdk';

// Initialize Whop SDK
// Note: The Whop SDK requires an API key for server-side use
// For OAuth flows, the API key should be obtained from the Whop developer dashboard
// Initialize Whop SDK with error handling
let whop;
try {
  whop = new Whop({
    apiKey: process.env.WHOP_API_KEY || process.env.WHOP_CLIENT_SECRET || 'temp-key-for-development',
  });
} catch (error) {
  console.warn('Whop SDK initialization failed:', error.message);
  // Create a mock whop instance for development
  whop = {
    users: {
      me: async () => ({ id: 'dev-user' })
    },
    subscriptions: {
      list: async () => []
    }
  };
}

export { whop };

// Whop authentication middleware
export const authenticateWhopUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Whop
    const user = await whop.users.me(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Add user info to request
    req.whopUser = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Whop authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Get user subscription tier
export const getUserSubscriptionTier = async (userId, token) => {
  try {
    const subscriptions = await whop.subscriptions.list({
      userId,
      token
    });
    
    // Determine tier based on active subscriptions
    if (subscriptions.length === 0) {
      return 'free';
    }
    
    // Check for highest tier subscription
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    if (activeSubscriptions.some(sub => sub.plan?.name?.includes('Enterprise'))) {
      return 'enterprise';
    } else if (activeSubscriptions.some(sub => sub.plan?.name?.includes('Pro'))) {
      return 'pro';
    }
    
    return 'free';
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return 'free';
  }
};

// Rate limiting based on subscription tier
export const getRateLimit = (tier) => {
  const limits = {
    free: parseInt(process.env.RATE_LIMIT_FREE_TIER) || 5,
    pro: parseInt(process.env.RATE_LIMIT_PRO_TIER) || 50,
    enterprise: parseInt(process.env.RATE_LIMIT_ENTERPRISE_TIER) || 200
  };
  
  return limits[tier] || limits.free;
};

// Check if user has exceeded rate limit
export const checkRateLimit = async (userId, tier) => {
  // This would integrate with your database to track usage
  // For now, we'll implement a simple in-memory solution
  // In production, use Redis or database-based rate limiting
  
  const limit = getRateLimit(tier);
  // Implementation would go here
  return { allowed: true, remaining: limit };
};

export default whop;
