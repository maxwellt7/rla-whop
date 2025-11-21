import { Whop } from '@whop/sdk';

// Initialize Whop SDK with error handling
let whop;
try {
  whop = new Whop({
    apiKey: process.env.WHOP_API_KEY || process.env.WHOP_CLIENT_SECRET || 'temp-key-for-development',
    appID: process.env.WHOP_APP_ID || process.env.WHOP_CLIENT_ID
  });
} catch (error) {
  console.warn('Whop SDK initialization failed:', error.message);
  whop = {
    users: {
      retrieve: async () => ({ id: 'dev-user', name: 'Developer User', source: 'mock' })
    },
    verifyUserToken: async () => ({ userId: 'dev-user', appId: 'dev-app' })
  };
}

const DEFAULT_SUBSCRIPTION_TIER = (process.env.DEFAULT_SUBSCRIPTION_TIER || 'pro').toLowerCase();
const DEV_TOKEN_VALUE = process.env.WHOP_DEV_TOKEN || 'dev-token';
const ALLOW_DEV_TOKEN = (process.env.ALLOW_DEV_TOKEN ?? 'true').toLowerCase() !== 'false';

const determineTierFromRequest = (req) => {
  const headerTier = req.headers['x-whop-subscription-tier'] || req.headers['x-whop-plan-tier'];
  if (typeof headerTier === 'string' && headerTier.trim()) {
    return headerTier.trim().toLowerCase();
  }

  const queryTier = typeof req.query?.subscriptionTier === 'string' ? req.query.subscriptionTier.toLowerCase() : null;
  if (queryTier) {
    return queryTier;
  }

  const bodyTier = typeof req.body?.subscriptionTier === 'string' ? req.body.subscriptionTier.toLowerCase() : null;
  if (bodyTier) {
    return bodyTier;
  }

  return DEFAULT_SUBSCRIPTION_TIER;
};

const getTokenFromRequest = (req) => {
  const headerToken = req.headers['x-whop-user-token'] || req.headers['whop-user-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const queryToken = typeof req.query?.whopToken === 'string' ? req.query.whopToken.trim() : null;
  if (queryToken) {
    return queryToken;
  }

  const bodyToken = typeof req.body?.whopToken === 'string' ? req.body.whopToken.trim() : null;
  return bodyToken || null;
};

const attachDevContext = (req, reason = 'dev-mode') => {
  req.whopUser = { id: 'dev-user', reason };
  req.userId = 'dev-user';
  req.subscriptionTier = determineTierFromRequest(req);
  req.isDevSession = true;
};

const resolveWhopUserProfile = async (userId) => {
  try {
    const profile = await whop.users.retrieve(userId);
    if (profile) {
      return profile;
    }
  } catch (error) {
    console.warn('Failed to fetch Whop user profile:', error.message);
  }

  return { id: userId };
};

export { whop };

// Whop authentication middleware
export const authenticateWhopUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      if (ALLOW_DEV_TOKEN) {
        attachDevContext(req, 'missing-token');
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'Missing Whop user token'
      });
    }

    if (ALLOW_DEV_TOKEN && token === DEV_TOKEN_VALUE) {
      attachDevContext(req, 'dev-token');
      req.whopToken = token;
      return next();
    }

    const verification = await whop.verifyUserToken(token, { dontThrow: true });

    if (!verification) {
      if (ALLOW_DEV_TOKEN) {
        attachDevContext(req, 'invalid-token');
        req.whopToken = DEV_TOKEN_VALUE;
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid Whop user token'
      });
    }

    req.userId = verification.userId;
    req.whopToken = token;
    req.subscriptionTier = determineTierFromRequest(req);
    req.whopUser = await resolveWhopUserProfile(verification.userId);

    next();
  } catch (error) {
    console.error('Whop authentication error:', error);

    if (ALLOW_DEV_TOKEN) {
      attachDevContext(req, 'auth-error');
      return next();
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Get user subscription tier
export const getUserSubscriptionTier = async (_userId, _token, req) => {
  if (req?.subscriptionTier) {
    return req.subscriptionTier;
  }

  return DEFAULT_SUBSCRIPTION_TIER;
};

// Rate limiting based on subscription tier
export const getRateLimit = (tier) => {
  const limits = {
    free: parseInt(process.env.RATE_LIMIT_FREE_TIER, 10) || 5,
    pro: parseInt(process.env.RATE_LIMIT_PRO_TIER, 10) || 50,
    enterprise: parseInt(process.env.RATE_LIMIT_ENTERPRISE_TIER, 10) || 200
  };

  return limits[tier] || limits.free;
};

// Check if user has exceeded rate limit
export const checkRateLimit = async (userId, tier) => {
  const limit = getRateLimit(tier);
  return { allowed: true, remaining: limit, limit, userId };
};

export default whop;
