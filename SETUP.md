# Quick Setup Guide

Follow these steps to get your Caring Reminder app running:

## Step 1: Install Backend Dependencies

Open Terminal and run:

```bash
cd "/Users/shaoyingluo/Caring Reminder/backend"
npm install
```

This will install all required packages (Express, SQLite, Twilio, etc.)

## Step 2: Set Up Environment Variables

Create a `.env` file in the backend folder with your Twilio credentials.

**If you don't have Twilio yet:**
1. Sign up at https://www.twilio.com/try-twilio (free trial available)
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number from Twilio

**Create the .env file:**
- In the backend folder, create a file named `.env`
- Add these lines (replace with your actual values):
  ```
  PORT=3001
  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_AUTH_TOKEN=your_auth_token_here
  TWILIO_PHONE_NUMBER=+1234567890
  ```

**Note:** You can skip Twilio setup for now if you just want to test the app - reminders won't work but everything else will!

## Step 3: Start the Backend Server

In Terminal, from the backend folder:

```bash
npm start
```

You should see: `Server running on port 3001`

**Keep this terminal window open!**

## Step 4: Install Frontend Dependencies

Open a NEW Terminal window and run:

```bash
cd "/Users/shaoyingluo/Caring Reminder/frontend"
npm install
```

This will install React and all frontend dependencies.

## Step 5: Start the Frontend Server

Still in the frontend folder:

```bash
npm start
```

This will:
- Start the React development server
- Open your browser to `http://localhost:3000`
- Automatically reload when you make code changes

## Step 6: Use the App!

1. **Create a Check-in:**
   - Visit http://localhost:3000
   - Edit the intro and questions (or use defaults)
   - Click "Create Check-in"
   - Copy the link and share it!

2. **Fill Out a Check-in:**
   - Open the shared link
   - Enter your name
   - Answer questions with bullet points
   - Click "Complete"

3. **View Responses:**
   - After creating a check-in, click "View Responses"
   - Or visit: http://localhost:3000/report/[checkin-id]

4. **Set Reminders:**
   - In the care report, click "Set Reminder" on any item
   - Enter your phone number (format: +1234567890)
   - Choose a date/time
   - You'll receive an SMS when the time comes!

## Troubleshooting

**Backend won't start:**
- Make sure port 3001 is not already in use
- Check that you've run `npm install` in the backend folder

**Frontend won't start:**
- Make sure the backend is running first
- Check that you've run `npm install` in the frontend folder

**Reminders not working:**
- Make sure your Twilio credentials are correct in `.env`
- Check that your phone number includes country code (+1 for US)
- Verify your Twilio account is active and has credits

**Database issues:**
- The database (`database.sqlite`) will be created automatically on first run
- If you want to start fresh, delete `backend/database.sqlite`

## Running Both Servers

You need TWO terminal windows:
- **Terminal 1:** Backend server (`npm start` in backend folder)
- **Terminal 2:** Frontend server (`npm start` in frontend folder)

Keep both running while using the app!

