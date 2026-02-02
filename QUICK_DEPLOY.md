# Quick Deployment Guide

## 🚀 Fastest Way: Railway + Vercel (Recommended)

### Step 1: Deploy Backend (Railway) - 5 minutes

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Node.js app
5. **Important**: Set the root directory to `backend` in project settings
6. Railway will automatically:
   - Install dependencies
   - Run `npm start`
   - Give you a URL like `https://your-app.railway.app`
7. Copy your backend URL

### Step 2: Deploy Frontend (Vercel) - 5 minutes

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. **Configure**:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)
5. **Add Environment Variable**:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-app.railway.app/api` (use your Railway URL)
6. Click "Deploy"
7. Vercel will give you a URL like `https://your-app.vercel.app`

### Step 3: Test It!

1. Visit your Vercel URL
2. Create a check-in
3. Share the link with someone
4. They can fill it out!

## 🎯 Alternative: Render (All-in-One)

### Deploy Backend

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - Name: `caring-reminder-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Create Web Service"
6. Copy the URL (e.g., `https://caring-reminder-backend.onrender.com`)

### Deploy Frontend

1. In Render, click "New +" → "Static Site"
2. Connect your GitHub repo
3. Settings:
   - Name: `caring-reminder-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. **Add Environment Variable**:
   - Key: `REACT_APP_API_URL`
   - Value: `https://caring-reminder-backend.onrender.com/api`
5. Click "Create Static Site"

## 📝 Important Notes

- **Database**: SQLite will work for small deployments. For production with many users, consider upgrading to PostgreSQL (available on Railway/Render)
- **Environment Variables**: Make sure `REACT_APP_API_URL` points to your backend URL with `/api` at the end
- **Custom Domain**: Both platforms allow you to add custom domains later

## 🔧 Troubleshooting

**Frontend can't connect to backend?**
- Check that `REACT_APP_API_URL` is set correctly
- Make sure it includes `/api` at the end
- Verify your backend is running (visit the backend URL directly)

**Build fails?**
- Make sure all dependencies are in `package.json`
- Check the build logs in your hosting platform

**Database issues?**
- SQLite should work automatically
- For PostgreSQL, you'll need to update `server.js` to use a PostgreSQL connection

## 🎉 You're Live!

Once deployed, share your frontend URL with anyone! They can:
- Create check-ins
- Fill out check-ins
- View care reports
- Add reminders to Google Calendar


