# 🚀 Whop Launch Checklist

Complete these steps to launch your Rapid Launch Agent on Whop.

## Phase 1: Deploy Backend (Railway)

### 1.1 Set Up Railway Account
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Install Railway CLI (optional): `npm i -g @railway/cli`

### 1.2 Deploy Backend
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `maxwellt7/rla-whop`
- [ ] Railway will auto-detect Dockerfile

### 1.3 Configure Environment Variables
Add these in Railway's Variables tab:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
WHOP_CLIENT_ID=app_RsMn7IKRAMfuhN
WHOP_CLIENT_SECRET=9R6FRhU9YNo4UuxdtpJqZiWvFf2yww3N9Wg6SypPylk
WHOP_REDIRECT_URI=https://YOUR-BACKEND-DOMAIN.railway.app/auth/callback
WHOP_SCOPE=read:users,write:users,read:payments,write:payments
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
```

### 1.4 Get Your Backend URL
- [ ] Click on your service
- [ ] Go to Settings → Generate Domain
- [ ] Copy the URL (e.g., `rapid-launch-agent-production.up.railway.app`)

### 1.5 Test Backend
- [ ] Visit `https://your-backend.railway.app/api/health`
- [ ] Should see: `{"status":"ok","message":"Rapid Launch Agent API is running"}`

## Phase 2: Deploy Frontend (Vercel)

### 2.1 Set Up Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub

### 2.2 Deploy Frontend
- [ ] Click "Add New..." → "Project"
- [ ] Import repository `maxwellt7/rla-whop`
- [ ] Configure build settings:
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Root Directory: `./`

### 2.3 Configure Environment Variables
Add in Vercel's Environment Variables:
```bash
VITE_API_URL=https://YOUR-BACKEND-DOMAIN.railway.app/api
```

### 2.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Get your frontend URL (e.g., `rapid-launch-agent.vercel.app`)

## Phase 3: Configure Whop App

### 3.1 Access Whop Developer Dashboard
- [ ] Go to https://whop.com/dashboard/developer
- [ ] Select your app: `app_RsMn7IKRAMfuhN`

### 3.2 Update App Settings
- [ ] App URL: `https://your-frontend.vercel.app`
- [ ] Redirect URI: `https://your-backend.railway.app/auth/callback`
- [ ] Save changes

### 3.3 Update Environment Variables
Go back to Railway and update:
```bash
WHOP_REDIRECT_URI=https://your-backend.railway.app/auth/callback
```

Go back to Vercel and update:
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

Redeploy both services after updating.

## Phase 4: Test Your App

### 4.1 Test Authentication
- [ ] Visit your frontend URL
- [ ] Click "Sign in with Whop"
- [ ] Should redirect to Whop OAuth
- [ ] After authorization, should redirect back to app
- [ ] Should see your profile and subscription tier

### 4.2 Test Core Features
- [ ] Create a new project
- [ ] Complete Offer Builder
- [ ] Complete Avatar Builder
- [ ] Test competitor analysis (Pro tier)
- [ ] Test manifold workflow (Pro tier)
- [ ] Test launch document generation (Pro tier)

### 4.3 Test Subscription Tiers
- [ ] Verify rate limiting works
- [ ] Test free tier limitations
- [ ] Test subscription upgrade flow

## Phase 5: App Store Submission

### 5.1 Complete App Profile
- [ ] Upload app icon (512x512 PNG)
- [ ] Upload banner image (1200x600 PNG)
- [ ] Add description
- [ ] Add category tags
- [ ] Set app visibility

### 5.2 Set Pricing
Configure your pricing tiers:
- [ ] Free Tier: $0/month (5 analyses)
- [ ] Pro Tier: $29/month (50 analyses)
- [ ] Enterprise Tier: $99/month (200 analyses)

### 5.3 Submit for Review
- [ ] Review all information
- [ ] Click "Submit for Review"
- [ ] Wait for approval (typically 1-3 days)

## Phase 6: Post-Launch

### 6.1 Monitor
- [ ] Set up error tracking (Sentry recommended)
- [ ] Monitor API usage
- [ ] Track user signups
- [ ] Monitor subscription conversions

### 6.2 Optimize
- [ ] Gather user feedback
- [ ] Fix bugs reported
- [ ] Add new features
- [ ] Improve performance

## 🔧 Quick Commands

### Test Backend Locally
```bash
cd /Users/maxmayes/Downloads/rapid-launch-agent-whop
npm install
npm run server
# Visit http://localhost:5000/api/health
```

### Test Frontend Locally
```bash
cd /Users/maxmayes/Downloads/rapid-launch-agent-whop
npm run dev
# Visit http://localhost:3000
```

### Build Docker Image
```bash
docker build -f Dockerfile.whop -t rapid-launch-agent-whop .
docker run -p 5000:5000 --env-file .env rapid-launch-agent-whop
```

## 📊 Important URLs

- **GitHub Repository**: https://github.com/maxwellt7/rla-whop
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Whop Developer Dashboard**: https://whop.com/dashboard/developer
- **Your App Dashboard**: https://whop.com/dashboard/developer/apps/app_RsMn7IKRAMfuhN

## 💡 Tips

1. **Environment Variables**: Make sure all environment variables are set correctly in both Railway and Vercel
2. **CORS**: The backend is configured to accept requests from any origin. You may want to restrict this in production.
3. **Monitoring**: Set up logging and monitoring early
4. **Testing**: Test thoroughly before submitting to the App Store
5. **Backup**: Keep your environment variables in a secure password manager

## 🆘 Troubleshooting

### Backend not responding
- Check Railway logs
- Verify environment variables
- Check if Anthropic API key is valid

### Authentication not working
- Verify redirect URI matches in both Whop dashboard and backend
- Check browser console for errors
- Verify Whop SDK is properly initialized

### Frontend can't reach backend
- Check VITE_API_URL environment variable
- Verify backend is deployed and running
- Check CORS configuration

---

**Status**: Ready to deploy!  
**Estimated Time**: 2-3 hours  
**Difficulty**: Intermediate
