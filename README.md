# Caring Reminder

A web application that helps you stay connected with the people you care about through intentional check-ins. Similar to Partiful, this app allows you to send personalized check-in questions to friends and family, receive their responses, and set reminders to follow up.

## Features

- **Create Custom Check-ins**: Build personalized check-ins with customizable questions and intro messages
- **Default Templates**: Start with thoughtful default questions about work, goals, and availability
- **Bullet Point Responses**: Recipients can provide detailed responses using bullet points (default 3, expandable)
- **Care Reports**: View organized responses from recipients with their names prominently displayed
- **SMS Reminders**: Set reminders on specific bullet points or entire care reports using Twilio SMS
- **Simple Sharing**: Copy and share check-in links easily

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Twilio account (for SMS reminders)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Twilio credentials:
```
PORT=3001
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

5. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, defaults to localhost:3001):
```
REACT_APP_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## How to Use

### Creating a Check-in

1. Visit the home page (`/`)
2. Optionally enter your email
3. Edit the intro message (default is pre-filled)
4. Edit the default questions or add new ones
5. Click "Create Check-in"
6. Copy the generated link and share it with recipients

### Filling Out a Check-in

1. Open the shared check-in link
2. Read the intro message
3. Enter your name
4. Answer each question using bullet points (default 3 per question, add more as needed)
5. Click "Complete" to submit

### Viewing Care Reports

1. Responses are automatically saved
2. Access reports at `/report/{checkinId}` (you'll need to track the checkin ID)
3. View all responses with recipient names
4. Set reminders on specific items or the entire report

### Setting Reminders

1. In the care report view, click "Set Reminder" on any bullet point or "Set Reminder for Entire Report"
2. Enter your phone number (include country code, e.g., +1234567890)
3. Select the date and time for the reminder
4. Click "Set Reminder"
5. You'll receive an SMS at the specified time via Twilio

## Project Structure

```
Caring Reminder/
├── backend/
│   ├── server.js              # Express server and API routes
│   ├── reminderService.js     # Twilio SMS and cron job for reminders
│   ├── package.json
│   └── database.sqlite        # SQLite database (created on first run)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateCheckin.js    # Component for creating check-ins
│   │   │   ├── FillCheckin.js      # Component for recipients to fill out
│   │   │   └── CareReport.js       # Component for viewing responses
│   │   ├── App.js
│   │   ├── api.js              # API client functions
│   │   └── index.js
│   └── package.json
└── README.md
```

## Database Schema

- **checkins**: Stores check-in templates (id, sender_email, intro, questions, created_at)
- **responses**: Stores recipient responses (id, checkin_id, recipient_name, answers, created_at)
- **reminders**: Stores reminder settings (id, response_id, reminder_type, item_index, reminder_time, sender_phone, sent, recipient_name, reminder_text)

## Notes

- The database is SQLite and will be created automatically on first run
- Reminders use Google Calendar integration (no SMS required)
- Phone numbers are optional (not required for reminders)
- The app runs locally by default; see [DEPLOYMENT.md](./DEPLOYMENT.md) or [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for production deployment

## Deployment

Want to make this a live website? See:
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Fastest way to deploy (Railway + Vercel)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide with multiple options

### Quick Start (5 minutes):
1. Deploy backend to [Railway](https://railway.app) (free tier available)
2. Deploy frontend to [Vercel](https://vercel.com) (free tier available)
3. Set `REACT_APP_API_URL` environment variable to your backend URL
4. Share your frontend URL with the world! 🎉

## License

MIT

