# GitHub Setup Instructions

Follow these steps to set up your GitHub repository and deploy your app.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `caring-reminder` (or any name you like)
4. Description: "A web app for creating caring check-ins and reminders"
5. Choose **Public** (or Private if you prefer)
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click **"Create repository"**

## Step 2: Push Your Code to GitHub

Open your terminal and run these commands:

```bash
# Navigate to your project folder
cd "/Users/shaoyingluo/Caring Reminder"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: Caring Reminder app with Google Calendar integration"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/caring-reminder.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: When you run `git push`, GitHub will ask for your credentials. You can:
- Use a Personal Access Token (recommended)
- Or use GitHub CLI: `gh auth login`

## Step 3: Get Your Repository URL

After pushing, you'll have a URL like:
`https://github.com/YOUR_USERNAME/caring-reminder`

Copy this URL - you'll need it for deployment!

## Step 4: Deploy to Railway (Backend)

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Find and select your `caring-reminder` repository
5. Railway will detect it's a Node.js app
6. **IMPORTANT**: Click on your project → Settings → Root Directory → Set to `backend`
7. Railway will automatically deploy!
8. Wait for deployment to finish, then copy your backend URL (e.g., `https://your-app.railway.app`)

## Step 5: Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"**
3. Import your `caring-reminder` repository
4. **Configure**:
   - Framework Preset: **Create React App** (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)
5. **Add Environment Variable**:
   - Click "Environment Variables"
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-app.railway.app/api` (use your Railway backend URL)
6. Click **"Deploy"**
7. Wait for deployment - you'll get a URL like `https://your-app.vercel.app`

## Step 6: Test Your Live Site! 🎉

1. Visit your Vercel URL
2. Create a test check-in
3. Share the link with someone to test
4. Everything should work!

## Troubleshooting

**Git push fails?**
- Make sure you're logged into GitHub
- Try using a Personal Access Token instead of password
- Or use GitHub Desktop app for easier setup

**Railway deployment fails?**
- Make sure Root Directory is set to `backend`
- Check the deployment logs for errors

**Frontend can't connect to backend?**
- Double-check `REACT_APP_API_URL` includes `/api` at the end
- Make sure your Railway backend is running (visit the URL directly)

**Need help?** Check the deployment logs in Railway/Vercel dashboards!

