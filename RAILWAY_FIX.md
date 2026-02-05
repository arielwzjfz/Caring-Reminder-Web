# Fix Railway Deployment Error

## The Problem
Railway is trying to build from the root directory, but your backend code is in the `backend` folder.

## Solution: Set Root Directory in Railway

### Step 1: Go to Railway Dashboard
1. Open your Railway project
2. Click on your service/project name

### Step 2: Set Root Directory
1. Click on the **"Settings"** tab (or gear icon)
2. Scroll down to find **"Root Directory"**
3. Click **"Edit"** or **"Change"**
4. Enter: `backend`
5. Click **"Save"** or **"Update"**

### Step 3: Redeploy
1. Go to the **"Deployments"** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

## Alternative: If Root Directory Setting Doesn't Work

If you can't find the Root Directory setting, try this:

1. **Delete the current service** in Railway
2. **Create a new service**:
   - Click "New" → "GitHub Repo"
   - Select your repository
   - **Before deploying**, go to Settings → Root Directory → Set to `backend`
   - Then deploy

## Check Build Logs

To see what went wrong:
1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click **"View Logs"**
4. Look for error messages

Common errors:
- "Cannot find package.json" → Root directory not set
- "Cannot find module" → Dependencies not installing correctly
- "Port already in use" → Usually not the issue on Railway

## Verify It's Working

After setting root directory and redeploying:
1. Wait 2-3 minutes for build
2. Check the **Deployments** tab - should show "Active" ✅
3. Go to **Settings** → **Domains** to get your URL
4. Visit the URL - should see your API working

## Still Having Issues?

If it still fails after setting root directory:
1. Check the build logs for specific error
2. Make sure `backend/package.json` exists
3. Make sure `backend/server.js` exists
4. Try deleting and recreating the service

