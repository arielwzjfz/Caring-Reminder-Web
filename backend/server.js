const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { generateGoogleCalendarUrl } = require('./calendarUtils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize reminder service (starts cron job)
require('./reminderService');

// CORS configuration - allow all origins in production (or specify your frontend URL)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create table
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    sender_email TEXT,
    sender_name TEXT,
    recipient_name TEXT,
    intro TEXT,
    questions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Run migrations to add missing columns (always run, will fail silently if column exists)
  db.run(`ALTER TABLE checkins ADD COLUMN sender_name TEXT`, (err) => {
    // Ignore "duplicate column" errors
  });
  db.run(`ALTER TABLE checkins ADD COLUMN recipient_name TEXT`, (err) => {
    // Ignore "duplicate column" errors
  });
  db.run(`ALTER TABLE checkins ADD COLUMN sender_phone TEXT`, (err) => {
    // Ignore "duplicate column" errors
  });

  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    checkin_id TEXT,
    recipient_name TEXT,
    answers TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (checkin_id) REFERENCES checkins(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    response_id TEXT,
    reminder_type TEXT,
    item_index INTEGER,
    question_index INTEGER,
    reminder_time DATETIME,
    sender_phone TEXT,
    sent BOOLEAN DEFAULT 0,
    recipient_name TEXT,
    reminder_text TEXT,
    is_recurring BOOLEAN DEFAULT 0,
    recurrence_pattern TEXT,
    FOREIGN KEY (response_id) REFERENCES responses(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating reminders table:', err);
    } else {
      // Run migrations to add missing columns
      db.run(`ALTER TABLE reminders ADD COLUMN question_index INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.log('Migration: question_index column already exists or error:', err.message);
        }
      });
      db.run(`ALTER TABLE reminders ADD COLUMN is_recurring BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.log('Migration: is_recurring column already exists or error:', err.message);
        }
      });
      db.run(`ALTER TABLE reminders ADD COLUMN recurrence_pattern TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.log('Migration: recurrence_pattern column already exists or error:', err.message);
        }
      });
    }
  });
});

// Get all check-ins
app.get('/api/checkins', (req, res) => {
  db.all('SELECT * FROM checkins ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => ({
      ...row,
      questions: row.questions ? JSON.parse(row.questions) : []
    })));
  });
});

// Get check-in by ID
app.get('/api/checkin/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM checkins WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Check-in not found' });
    }
    res.json({
      ...row,
      questions: JSON.parse(row.questions),
      recipient_name: row.recipient_name,
      sender_name: row.sender_name
    });
  });
});

// Create new check-in
app.post('/api/checkin', (req, res) => {
  const { intro, questions, sender_email, recipient_name, sender_name, sender_phone } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO checkins (id, sender_email, sender_name, recipient_name, intro, questions, sender_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, sender_email || null, sender_name || null, recipient_name || null, intro, JSON.stringify(questions), sender_phone || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, link: `/checkin/${id}` });
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Submit response
app.post('/api/response', (req, res) => {
  const { checkin_id, recipient_name, answers } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO responses (id, checkin_id, recipient_name, answers) VALUES (?, ?, ?, ?)',
    [id, checkin_id, recipient_name, JSON.stringify(answers)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, success: true });
    }
  );
});

// Get responses for a check-in
app.get('/api/checkin/:id/responses', (req, res) => {
  const { id } = req.params;
    // First get the checkin to get questions and recipient name
    db.get('SELECT questions, recipient_name FROM checkins WHERE id = ?', [id], (err, checkinRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!checkinRow) {
      return res.status(404).json({ error: 'Check-in not found' });
    }
    
    const questions = JSON.parse(checkinRow.questions);
    
    // Then get responses
    db.all(
      'SELECT * FROM responses WHERE checkin_id = ? ORDER BY created_at DESC',
      [id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows.map(row => ({
          ...row,
          answers: JSON.parse(row.answers),
          questions: questions,
          recipient_name: checkinRow.recipient_name || row.recipient_name,
          checkin_recipient_name: checkinRow.recipient_name
        })));
      }
    );
  });
});

// Get response by ID
app.get('/api/response/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM responses WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json({
      ...row,
      answers: JSON.parse(row.answers)
    });
  });
});

// Create reminder
app.post('/api/reminder', (req, res) => {
  const { response_id, reminder_type, item_index, question_index, reminder_time, sender_phone, recipient_name, reminder_text, is_recurring, recurrence_pattern } = req.body;
  const id = uuidv4();
  
  // Generate Google Calendar URL
  const startDate = new Date(reminder_time);
  const calendarUrl = generateGoogleCalendarUrl({
    title: reminder_text,
    startDate: startDate,
    description: `Reminder: ${reminder_text}`,
    isRecurring: is_recurring,
    recurrencePattern: recurrence_pattern
  });
  
  db.run(
    'INSERT INTO reminders (id, response_id, reminder_type, item_index, question_index, reminder_time, sender_phone, recipient_name, reminder_text, is_recurring, recurrence_pattern) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, response_id, reminder_type, item_index || null, question_index || null, reminder_time, sender_phone, recipient_name, reminder_text, is_recurring ? 1 : 0, recurrence_pattern || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, success: true, calendar_url: calendarUrl });
    }
  );
});

// Get all reminders for all check-ins (for dashboard) - returns all reminders, both sent and unsent
// IMPORTANT: This route must come BEFORE /api/reminders/:phone to avoid route conflicts
app.get('/api/reminders/all', (req, res) => {
  console.log('GET /api/reminders/all called');
  db.all(
    `SELECT r.*, resp.checkin_id, c.recipient_name as checkin_recipient_name
     FROM reminders r
     LEFT JOIN responses resp ON r.response_id = resp.id
     LEFT JOIN checkins c ON resp.checkin_id = c.id
     ORDER BY r.reminder_time ASC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching all reminders:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Fetched ${rows ? rows.length : 0} reminders for dashboard`);
      console.log('Reminders data:', JSON.stringify(rows, null, 2));
      res.json(rows || []);
    }
  );
});

// Get reminder calendar URL
app.get('/api/reminder/:id/calendar', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM reminders WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    const startDate = new Date(row.reminder_time);
    const calendarUrl = generateGoogleCalendarUrl({
      title: row.reminder_text,
      startDate: startDate,
      description: `Reminder: ${row.reminder_text}`,
      isRecurring: row.is_recurring === 1 || row.is_recurring === true,
      recurrencePattern: row.recurrence_pattern
    });
    
    res.json({ calendar_url: calendarUrl });
  });
});

// Get reminders for a response
app.get('/api/response/:id/reminders', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM reminders WHERE response_id = ? ORDER BY reminder_time ASC',
    [id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get reminders for a sender
app.get('/api/reminders/:phone', (req, res) => {
  const { phone } = req.params;
  db.all(
    'SELECT * FROM reminders WHERE sender_phone = ? AND sent = 0 ORDER BY reminder_time ASC',
    [phone],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Update reminder
app.put('/api/reminder/:id', (req, res) => {
  const { id } = req.params;
  const { reminder_time, reminder_text, is_recurring, recurrence_pattern } = req.body;
  
  db.run(
    'UPDATE reminders SET reminder_time = ?, reminder_text = ?, is_recurring = ?, recurrence_pattern = ? WHERE id = ?',
    [reminder_time, reminder_text, is_recurring ? 1 : 0, recurrence_pattern || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reminder not found' });
      }
      
      // Generate updated calendar URL
      const startDate = new Date(reminder_time);
      const calendarUrl = generateGoogleCalendarUrl({
        title: reminder_text,
        startDate: startDate,
        description: `Reminder: ${reminder_text}`,
        isRecurring: is_recurring,
        recurrencePattern: recurrence_pattern
      });
      
      res.json({ success: true, calendar_url: calendarUrl });
    }
  );
});

// Delete reminder
app.delete('/api/reminder/:id', (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM reminders WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reminder not found' });
      }
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

