# Whop App Deployment Configuration

## Environment Variables
```bash
# Whop Configuration
WHOP_CLIENT_ID=app_RsMn7IKRAMfuhN
WHOP_CLIENT_SECRET=9R6FRhU9YNo4UuxdtpJqZiWvFf2yww3N9Wg6SypPylk
WHOP_REDIRECT_URI=https://your-app-domain.com/auth/callback
WHOP_SCOPE=read:users,write:users,read:payments,write:payments

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GPT_MODEL=claude-3-5-sonnet-20241022
GPT_TEMPERATURE=0.7

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_FREE_TIER=5
RATE_LIMIT_PRO_TIER=50
RATE_LIMIT_ENTERPRISE_TIER=200
```

## Deployment Steps

### 1. Build the Application
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Test the build
npm run preview
```

### 2. Deploy to Whop Platform
```bash
# Build Docker image
docker build -f Dockerfile.whop -t rapid-launch-agent-whop .

# Test locally
docker run -p 5000:5000 --env-file .env rapid-launch-agent-whop

# Deploy to Whop (using Whop CLI)
whop apps deploy --config whop.config.json
```

### 3. Configure Webhooks
Set up webhook endpoints to handle subscription events:
- `POST /webhooks/subscription-created`
- `POST /webhooks/subscription-updated`
- `POST /webhooks/subscription-cancelled`

### 4. App Store Submission
1. Complete app profile in Whop Developer Dashboard
2. Upload screenshots and app icon
3. Set pricing tiers
4. Submit for review

## Testing Checklist

### Authentication
- [ ] Whop OAuth flow works
- [ ] User profile retrieval
- [ ] Token validation
- [ ] Logout functionality

### Subscription Management
- [ ] Free tier limitations
- [ ] Pro tier features
- [ ] Enterprise tier features
- [ ] Rate limiting enforcement

### Core Features
- [ ] Offer analysis (free tier)
- [ ] Avatar builder (free tier)
- [ ] Competitor analysis (pro tier)
- [ ] Manifold workflow (pro tier)
- [ ] Launch document (pro tier)
- [ ] Export functionality (pro tier)

### API Endpoints
- [ ] All routes require authentication
- [ ] Rate limiting works correctly
- [ ] Subscription tier validation
- [ ] Error handling

## Monitoring

### Health Checks
- API health endpoint: `/api/health`
- Database connectivity
- External API status

### Logging
- API request/response logs
- Error tracking
- Usage analytics
- Performance metrics

## Security Considerations

1. **Authentication**: All API routes protected with Whop authentication
2. **Rate Limiting**: Prevents abuse and enforces subscription limits
3. **Data Isolation**: User data separated by Whop user ID
4. **Input Validation**: All inputs validated and sanitized
5. **CORS**: Properly configured for production

## Performance Optimization

1. **Caching**: Implement Redis for rate limiting and session storage
2. **Database**: Use PostgreSQL for production (currently SQLite)
3. **CDN**: Serve static assets through CDN
4. **Monitoring**: Implement APM for performance tracking
