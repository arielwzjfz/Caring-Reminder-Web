const twilio = require('twilio');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cron = require('node-cron');

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not configured. Reminder SMS functionality will be disabled.');
}

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Check for reminders that need to be sent (runs every minute)
cron.schedule('* * * * *', () => {
  const now = new Date().toISOString();
  
  db.all(
    `SELECT * FROM reminders WHERE sent = 0 AND reminder_time <= ?`,
    [now],
    (err, rows) => {
      if (err) {
        console.error('Error checking reminders:', err);
        return;
      }
      
      rows.forEach(reminder => {
        sendReminder(reminder);
      });
    }
  );
});

async function sendReminder(reminder) {
  if (!client) {
    console.error('Cannot send reminder: Twilio client not initialized');
    return;
  }

  try {
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: reminder.reminder_text,
      from: twilioPhoneNumber,
      to: reminder.sender_phone
    });
    
    console.log(`Reminder sent: ${message.sid}`);
    
    // Mark reminder as sent
    db.run(
      'UPDATE reminders SET sent = 1 WHERE id = ?',
      [reminder.id],
      (err) => {
        if (err) {
          console.error('Error updating reminder:', err);
        }
      }
    );
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}

module.exports = { sendReminder };

