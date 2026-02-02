# Deployment Guide

This guide will help you deploy Caring Reminder as a live website.

## Recommended Deployment Platforms

- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel or Netlify

## Option 1: Railway (Backend) + Vercel (Frontend) - Recommended

### Deploy Backend to Railway

1. **Sign up for Railway**: Go to [railway.app](https://railway.app) and sign up

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or upload the backend folder)

3. **Configure the backend**:
   - Railway will auto-detect Node.js
   - Set the root directory to `backend`
   - Add environment variables:
     - `PORT` (Railway will set this automatically, but you can use `3001` as fallback)
   - The database will be created automatically

4. **Get your backend URL**:
   - Railway will give you a URL like `https://your-app.railway.app`
   - Copy this URL

### Deploy Frontend to Vercel

1. **Sign up for Vercel**: Go to [vercel.com](https://vercel.com) and sign up

2. **Create a new project**:
   - Click "Add New Project"
   - Import your GitHub repository (or upload the frontend folder)

3. **Configure the frontend**:
   - Set the root directory to `frontend`
   - Add environment variable:
     - `REACT_APP_API_URL` = `https://your-app.railway.app/api`
     - Replace with your actual Railway backend URL

4. **Deploy**:
   - Vercel will automatically build and deploy
   - You'll get a URL like `https://your-app.vercel.app`

## Option 2: Render (Full Stack)

### Deploy Backend to Render

1. **Sign up for Render**: Go to [render.com](https://render.com)

2. **Create a Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - Name: `caring-reminder-backend`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment: `Node`
   - Add environment variable:
     - `PORT` = `10000` (Render's default)

3. **Get your backend URL**: `https://caring-reminder-backend.onrender.com`

### Deploy Frontend to Render

1. **Create a Static Site**:
   - Click "New +" → "Static Site"
   - Connect your GitHub repo
   - Settings:
     - Name: `caring-reminder-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `build`
   - Add environment variable:
     - `REACT_APP_API_URL` = `https://caring-reminder-backend.onrender.com/api`

## Option 3: Heroku (Backend) + Netlify (Frontend)

### Deploy Backend to Heroku

1. **Install Heroku CLI**: [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Create Heroku app**:
   ```bash
   cd backend
   heroku create caring-reminder-backend
   ```

3. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a caring-reminder-backend
   git push heroku main
   ```

4. **Get your backend URL**: `https://caring-reminder-backend.herokuapp.com`

### Deploy Frontend to Netlify

1. **Sign up for Netlify**: Go to [netlify.com](https://netlify.com)

2. **Create a new site**:
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repo
   - Settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `build`
   - Add environment variable:
     - `REACT_APP_API_URL` = `https://caring-reminder-backend.herokuapp.com/api`

## Important Notes

### Database
- SQLite works for small to medium deployments
- For production with many users, consider PostgreSQL:
  - Railway/Render offer PostgreSQL add-ons
  - You'll need to update the database connection in `server.js`

### Environment Variables

**Backend** (set in your hosting platform):
- `PORT` - Usually set automatically by hosting platform

**Frontend** (set in your hosting platform):
- `REACT_APP_API_URL` - Your backend API URL (e.g., `https://your-backend.railway.app/api`)

### Custom Domain (Optional)

1. **Backend**: Add custom domain in your hosting platform settings
2. **Frontend**: Add custom domain in Vercel/Netlify settings
3. **Update**: Update `REACT_APP_API_URL` to use your custom domain

## Testing Your Deployment

1. Visit your frontend URL
2. Create a test check-in
3. Share the link and test filling it out
4. Verify reminders work (Google Calendar integration)

## Troubleshooting

- **CORS errors**: Make sure your backend URL in `REACT_APP_API_URL` matches exactly
- **Database issues**: Check that the database file is being created (SQLite) or connection string is correct (PostgreSQL)
- **Build errors**: Check that all dependencies are in `package.json`


