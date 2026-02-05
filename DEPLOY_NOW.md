# Deploy to Railway & Vercel - Step by Step

Your code is on GitHub! Now let's deploy it. 🚀

## Part 1: Deploy Backend to Railway

### Step 1: Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (click "Login with GitHub")
4. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your repository: **`Caring-Reminder-Web`**
4. Click on it

### Step 3: Configure Backend
1. Railway will start deploying automatically
2. **IMPORTANT**: Click on your project name
3. Go to **Settings** tab
4. Scroll to **"Root Directory"**
5. Click **"Edit"** and set it to: `backend`
6. Click **"Save"**

### Step 4: Wait for Deployment
- Railway will automatically:
  - Install dependencies (`npm install`)
  - Run `npm start`
  - Deploy your backend

### Step 5: Get Your Backend URL
1. Go to the **Settings** tab
2. Scroll to **"Domains"**
3. You'll see a URL like: `https://your-app.railway.app`
4. **Copy this URL** - you'll need it for Vercel!

**Note**: If you don't see a domain, click **"Generate Domain"**

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Sign up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with **GitHub** (click "Continue with GitHub")
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Project
1. Click **"Add New Project"**
2. Find your repository: **`arielwzjfz/Caring-Reminder-Web`**
3. Click **"Import"**

### Step 3: Configure Frontend
1. **Framework Preset**: Should auto-detect "Create React App" ✅
2. **Root Directory**: Click **"Edit"** and set to: `frontend`
3. **Build Command**: Should be `npm run build` (auto-filled) ✅
4. **Output Directory**: Should be `build` (auto-filled) ✅

### Step 4: Add Environment Variable (CRITICAL!)
1. Scroll down to **"Environment Variables"**
2. Click **"Add New"**
3. Add this:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-railway-url.railway.app/api`
     - Replace `your-railway-url` with your actual Railway URL from Part 1!
     - **IMPORTANT**: Include `/api` at the end!
4. Click **"Save"**

### Step 5: Deploy!
1. Click **"Deploy"** button at the bottom
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://your-app.vercel.app`

---

## Part 3: Test Your Live Site! 🎉

1. Visit your Vercel URL
2. Try creating a check-in
3. Share the link with someone to test
4. Everything should work!

---

## Troubleshooting

### Backend Issues (Railway)

**"Deployment failed"**
- Check the **Deployments** tab → **View Logs**
- Make sure Root Directory is set to `backend`
- Check that `package.json` exists in the backend folder

**"Can't find server.js"**
- Root Directory must be `backend`
- Go to Settings → Root Directory → Set to `backend`

### Frontend Issues (Vercel)

**"Can't connect to backend"**
- Check `REACT_APP_API_URL` is set correctly
- Make sure it includes `/api` at the end
- Verify your Railway backend is running (visit the URL directly)

**"Build failed"**
- Check the build logs in Vercel
- Make sure Root Directory is set to `frontend`
- Check that `package.json` exists in the frontend folder

### CORS Errors
- Make sure `REACT_APP_API_URL` matches your Railway URL exactly
- Check Railway backend is running

---

## Quick Checklist

- [ ] Railway: Backend deployed
- [ ] Railway: Root Directory set to `backend`
- [ ] Railway: Got backend URL
- [ ] Vercel: Frontend deployed
- [ ] Vercel: Root Directory set to `frontend`
- [ ] Vercel: `REACT_APP_API_URL` environment variable set
- [ ] Vercel: `REACT_APP_API_URL` includes `/api` at the end
- [ ] Tested creating a check-in
- [ ] Tested sharing a link

---

## Need Help?

- **Railway Logs**: Go to your project → Deployments → Click on deployment → View Logs
- **Vercel Logs**: Go to your project → Deployments → Click on deployment → View Function Logs
- Both platforms have great documentation and support!

---

## You're Live! 🎊

Once deployed, share your Vercel URL with anyone! They can:
- Create check-ins
- Fill out check-ins via shared links
- View care reports
- Add reminders to Google Calendar

