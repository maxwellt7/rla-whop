import { getUserSubscriptionTier, checkRateLimit } from '../config/whop.js';

// Rate limiting middleware
export const rateLimitMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    const subscriptionTier = await getUserSubscriptionTier(userId, req.headers.authorization?.substring(7));
    
    const rateLimitCheck = await checkRateLimit(userId, subscriptionTier);
    
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `You have exceeded your ${subscriptionTier} tier limit. Please upgrade your plan.`,
        remaining: rateLimitCheck.remaining,
        subscriptionTier
      });
    }

    // Add rate limit info to request
    req.rateLimitInfo = {
      tier: subscriptionTier,
      remaining: rateLimitCheck.remaining,
      limit: rateLimitCheck.limit
    };

    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    next();
  }
};

// Usage tracking middleware
export const trackUsage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const endpoint = req.path;
    const method = req.method;
    
    // Track API usage in database
    // This would integrate with your database to track usage
    console.log(`API Usage: ${method} ${endpoint} by user ${userId}`);
    
    next();
  } catch (error) {
    console.error('Usage tracking error:', error);
    next();
  }
};

// Subscription tier validation middleware
export const validateSubscriptionTier = (requiredTier) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const subscriptionTier = await getUserSubscriptionTier(userId, req.headers.authorization?.substring(7));
      
      const tierLevels = {
        'free': 1,
        'pro': 2,
        'enterprise': 3
      };
      
      const userTierLevel = tierLevels[subscriptionTier] || 1;
      const requiredTierLevel = tierLevels[requiredTier] || 1;
      
      if (userTierLevel < requiredTierLevel) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient subscription tier',
          message: `This feature requires ${requiredTier} tier or higher. Your current tier: ${subscriptionTier}`,
          currentTier: subscriptionTier,
          requiredTier,
          upgradeUrl: '/subscription'
        });
      }
      
      next();
    } catch (error) {
      console.error('Subscription validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate subscription'
      });
    }
  };
};
