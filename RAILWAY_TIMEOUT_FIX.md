# 🔧 Railway Timeout Fix for Manifold Workflow

## 🐛 The Problem

Railway is restarting your container after ~2.5 minutes, which interrupts the Manifold workflow (takes 2-4 minutes to process all 14 nodes).

**Error pattern:**
```
Processing node 6/14: Resonance Hierarchy
[2-3 minutes later]
Starting Container  ← Railway restarts!
Workflow interrupted ❌
```

---

## ✅ Solution: Configure Railway Settings

### Option 1: Update via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - https://railway.app/project/your-project

2. **Click your service** (rapid-launch-agent)

3. **Go to Settings tab**

4. **Scroll to "Healthcheck" section**
   - **Healthcheck Path:** `/api/health`
   - **Healthcheck Timeout:** `600` (10 minutes)
   - **Healthcheck Interval:** `60` (1 minute)

5. **Scroll to "Service" section**
   - Look for any "Request Timeout" or "Timeout" settings
   - Increase to at least `600` seconds (10 minutes)

6. **Click "Save" or "Update"**

7. **Redeploy** your service

---

### Option 2: Config Files (Already Updated)

I've already updated these files:
- ✅ `railway.json` - healthcheckTimeout: 600
- ✅ `railway.toml` - healthcheckTimeout: 600

**Next:** Railway should auto-deploy with these new settings

---

## 🧪 How to Test After Fix

1. **Wait for Railway to redeploy** (~1-2 minutes)

2. **Go to your app:** https://rapid-launch-agent-aym3.vercel.app/

3. **Navigate to Manifold page**

4. **Click "Run Workflow"**

5. **Watch the progress bar** go through all 14 nodes

6. **Should complete in 2-4 minutes** without interruption

7. **Check Railway logs** - should see:
   ```
   Processing node 1/14: Build A Buyer
   Processing node 2/14: Pain Matrix
   ...
   Processing node 14/14: Ejection Triggers
   ✅ POST /api/analyze/manifold - [time]ms
   ```

---

## 🔍 Alternative: Check Railway Dashboard Settings

If the workflow still times out:

### Check Deployment Settings

1. Railway Dashboard → Your Service → **Settings**
2. Look for these sections:
   - **Healthcheck Settings**
   - **Deployment Settings**  
   - **Resource Limits**

### Common Settings to Adjust:

| Setting | Recommended Value |
|---------|------------------|
| Healthcheck Timeout | 600 seconds (10 min) |
| Healthcheck Interval | 60 seconds (1 min) |
| Request Timeout | 600 seconds (10 min) |
| Restart Policy | ON_FAILURE |

---

## 💡 Why This Happens

**Railway's default behavior:**
- Healthcheck timeout: ~5 minutes (300 seconds)
- If app doesn't respond to health checks, Railway restarts it
- Long-running API calls (like Manifold) can trigger this

**Our Manifold workflow:**
- Processes 14 nodes sequentially
- Each node takes ~10-20 seconds
- Total time: 2-4 minutes
- **Needs longer timeout!**

---

## 🚨 If Still Timing Out

If the workflow still fails after increasing timeouts, we have two options:

### Option A: Split into Smaller Batches
Process 7 nodes at a time instead of all 14

### Option B: Background Processing
Implement a job queue system (more complex)

**Let's try the timeout fix first!** It should work for most cases.

---

## 📋 Checklist

- [x] Updated `railway.json` with 600s timeout
- [x] Updated `railway.toml` with 600s timeout
- [x] Pushed to GitHub
- [ ] Wait for Railway auto-deploy
- [ ] Check Railway dashboard settings
- [ ] Test Manifold workflow again
- [ ] Verify all 14 nodes complete

---

**After Railway redeploys, test the Manifold workflow again!** 🚀

It should now complete all 14 nodes without interruption.

