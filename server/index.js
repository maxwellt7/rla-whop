import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root FIRST before importing routes
dotenv.config({ path: join(__dirname, '..', '.env') });

// Now import everything else after env is loaded
import express from 'express';
import cors from 'cors';
import { analyzeOfferRoute } from './routes/offerAnalysis.js';
import { analyzeAvatarRoute } from './routes/avatarAnalysis.js';
import { analyzeCompetitorsRoute } from './routes/competitorAnalysis.js';
import { runManifoldRoute } from './routes/manifoldWorkflow.js';
import { generateLaunchDocRoute } from './routes/launchDocument.js';
import { queryRoute } from './routes/query.js';
import { exportRoute } from './routes/export.js';
import { getGenerationProgressRoute, getLatestGenerationRoute } from './routes/progress.js';
import { authenticateWhopUser, getUserSubscriptionTier, checkRateLimit, getRateLimit } from './config/whop.js';
import { rateLimitMiddleware, trackUsage, validateSubscriptionTier } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rapid Launch Agent API is running' });
});

// Routes with Whop authentication and rate limiting
app.post('/api/analyze/offer', authenticateWhopUser, rateLimitMiddleware, trackUsage, analyzeOfferRoute);
app.post('/api/analyze/avatar', authenticateWhopUser, rateLimitMiddleware, trackUsage, analyzeAvatarRoute);
app.post('/api/analyze/competitors', authenticateWhopUser, rateLimitMiddleware, trackUsage, validateSubscriptionTier('pro'), analyzeCompetitorsRoute);
app.post('/api/analyze/manifold', authenticateWhopUser, rateLimitMiddleware, trackUsage, validateSubscriptionTier('pro'), runManifoldRoute);
app.post('/api/generate/launch-document', authenticateWhopUser, rateLimitMiddleware, trackUsage, validateSubscriptionTier('pro'), generateLaunchDocRoute);
app.get('/api/generation/progress/:generationId', authenticateWhopUser, getGenerationProgressRoute);
app.get('/api/generation/latest/:projectId', authenticateWhopUser, getLatestGenerationRoute);
app.post('/api/query', authenticateWhopUser, rateLimitMiddleware, trackUsage, queryRoute);
app.post('/api/export/:format', authenticateWhopUser, rateLimitMiddleware, trackUsage, validateSubscriptionTier('pro'), exportRoute);

// Whop-specific routes
app.get('/api/auth/whop', (req, res) => {
  const authUrl = `https://whop.com/oauth/authorize?client_id=${process.env.WHOP_CLIENT_ID}&redirect_uri=${process.env.WHOP_REDIRECT_URI}&scope=${process.env.WHOP_SCOPE}&response_type=code`;
  res.json({ authUrl });
});

app.get('/api/user/profile', authenticateWhopUser, async (req, res) => {
  try {
    const subscriptionTier = await getUserSubscriptionTier(req.userId, req.headers.authorization?.substring(7));
    res.json({
      success: true,
      data: {
        user: req.whopUser,
        subscriptionTier,
        rateLimit: getRateLimit(subscriptionTier)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Rapid Launch Agent server running on port ${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api`);
  console.log(`🤖 Using Claude Sonnet 4.5 for AI analysis`);
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not found in environment variables');
  }
});

