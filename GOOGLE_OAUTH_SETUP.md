# Google OAuth Setup Guide

This guide will help you set up Google Sign-In for your Caring Reminder application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to Google Cloud Console

## Step 1: Create a Google OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in the required information (App name, User support email, Developer contact)
     - Add your domain to authorized domains
     - Save and continue through the scopes and test users screens
   
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Caring Reminder Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://your-vercel-domain.vercel.app` (for production)
     - `https://your-production-domain.com` (if you have a custom domain)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for local development)
     - `https://your-vercel-domain.vercel.app` (for production)
     - `https://your-production-domain.com` (if you have a custom domain)
   - Click "Create"
   - **Copy the Client ID** (you'll need this)

## Step 2: Configure Environment Variables

### Backend (.env file in `/backend` folder)

Add the following to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Frontend (Vercel Environment Variables)

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add a new variable:
   - **Name**: `REACT_APP_GOOGLE_CLIENT_ID`
   - **Value**: Your Google Client ID (same as backend)
   - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

### Local Development (Frontend)

Create or update `.env` file in `/frontend` folder:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Step 3: Install Dependencies

### Backend

```bash
cd backend
npm install
```

This will install `google-auth-library` which is needed for verifying Google tokens.

### Frontend

No additional dependencies needed! The Google Identity Services script is loaded dynamically.

## Step 4: Test the Integration

1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to the login or signup page
4. You should see a "Sign in with Google" button
5. Click it and test the Google sign-in flow

## How It Works

1. **User clicks "Sign in with Google"**: Google Identity Services opens a popup
2. **User authenticates with Google**: Google returns a credential token
3. **Frontend sends token to backend**: The credential is sent to `/api/auth/google`
4. **Backend verifies token**: Uses Google's library to verify the token is valid
5. **User created/logged in**: If new user, account is created. If existing, user is logged in.
6. **JWT token returned**: Backend generates a JWT token for the user session

## Important Notes

- **Google OAuth users don't have passwords**: The `password_hash` field is `NULL` for Google-authenticated users
- **Email must be unique**: If a user tries to sign up with email/password using an email that was used for Google sign-in, they'll get an error
- **Same account, different methods**: If a user signs up with email/password first, they can't later use Google sign-in with the same email (and vice versa)
- **Security**: The Google Client ID is public (it's safe to expose in frontend code), but make sure your backend properly verifies tokens

## Troubleshooting

### "Google sign-in button not showing"
- Check that `REACT_APP_GOOGLE_CLIENT_ID` is set in your environment variables
- Check browser console for errors
- Make sure the Google Identity Services script loaded successfully

### "Invalid Google token" error
- Verify `GOOGLE_CLIENT_ID` in backend `.env` matches the frontend `REACT_APP_GOOGLE_CLIENT_ID`
- Make sure the authorized origins in Google Console include your domain
- Check that the token hasn't expired (they expire quickly)

### "Google OAuth not configured" error
- Make sure `GOOGLE_CLIENT_ID` is set in your backend `.env` file
- Restart your backend server after adding the environment variable

## Production Deployment

When deploying to production:

1. **Railway (Backend)**:
   - Add `GOOGLE_CLIENT_ID` to Railway environment variables
   - Make sure authorized origins include your production domain

2. **Vercel (Frontend)**:
   - Add `REACT_APP_GOOGLE_CLIENT_ID` to Vercel environment variables
   - Redeploy after adding the variable

3. **Update Google Console**:
   - Add your production domain to "Authorized JavaScript origins"
   - Add your production domain to "Authorized redirect URIs"

That's it! Your users can now sign in with either Google or email/password! 🎉

