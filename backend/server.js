const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateGoogleCalendarUrl } = require('./calendarUtils');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const app = express();
const PORT = process.env.PORT || 3001;

// Reminder service removed - using Google Calendar URLs instead

// CORS configuration - allow all origins in production (or specify your frontend URL)
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, process.env.FRONTEND_URL.replace(/\/$/, '')] // Allow with and without trailing slash
  : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create table
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    sender_email TEXT,
    sender_name TEXT,
    recipient_name TEXT,
    intro TEXT,
    questions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
  db.run(`ALTER TABLE checkins ADD COLUMN user_id TEXT`, (err) => {
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
      db.run(`ALTER TABLE reminders ADD COLUMN recipient_phone TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.log('Migration: recipient_phone column already exists or error:', err.message);
        }
      });
    }
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        return res.status(400).json({ error: 'Email already registered. Try logging in instead.' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user
      db.run(
        'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
        [userId, email, passwordHash, name || null],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Generate token
          const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
          res.json({ token, user: { id: userId, email, name: name || null } });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has a password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

// Get all check-ins (only for authenticated user)
app.get('/api/checkins', authenticateToken, (req, res) => {
  db.all('SELECT * FROM checkins WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => ({
      ...row,
      questions: row.questions ? JSON.parse(row.questions) : []
    })));
  });
});

// Get check-in by ID (public for filling out, but verify ownership for viewing reports)
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

// Create new check-in (requires authentication)
app.post('/api/checkin', authenticateToken, (req, res) => {
  const { intro, questions, sender_email, recipient_name, sender_name, sender_phone } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO checkins (id, user_id, sender_email, sender_name, recipient_name, intro, questions, sender_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, sender_email || null, sender_name || null, recipient_name || null, intro, JSON.stringify(questions), sender_phone || null],
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

// Get responses for a check-in (requires authentication and ownership verification)
app.get('/api/checkin/:id/responses', authenticateToken, (req, res) => {
  const { id } = req.params;
    // First get the checkin to verify ownership
    db.get('SELECT questions, recipient_name, user_id FROM checkins WHERE id = ?', [id], (err, checkinRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!checkinRow) {
      return res.status(404).json({ error: 'Check-in not found' });
    }
    
    // Verify ownership
    if (checkinRow.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. This check-in belongs to another user.' });
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

// Create reminder (requires authentication and ownership verification)
app.post('/api/reminder', authenticateToken, (req, res) => {
  const { response_id, reminder_type, item_index, question_index, reminder_time, sender_phone, recipient_name, reminder_text, is_recurring, recurrence_pattern, recipient_phone } = req.body;
  
  // Verify ownership: check if the response belongs to a check-in owned by the user
  db.get(
    `SELECT c.user_id, r.answers, c.questions FROM responses r 
     JOIN checkins c ON r.checkin_id = c.id 
     WHERE r.id = ?`,
    [response_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Response not found' });
      }
      if (row.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. This response belongs to another user.' });
      }

      const id = uuidv4();
      
      // Generate SMS message based on reminder type
      let smsMessage = '';
      if (recipient_phone) {
        if (reminder_type === 'item' && question_index !== null && item_index !== null) {
          try {
            const answers = JSON.parse(row.answers);
            const item = answers[question_index]?.[item_index] || '';
            if (item) {
              smsMessage = `How is ${item}?`;
            }
          } catch (e) {
            console.error('Error parsing answers for SMS:', e);
          }
        } else if (reminder_type === 'full') {
          smsMessage = `How are you doing?`;
        }
      }
      
      // Generate Google Calendar URL with SMS link
      const startDate = new Date(reminder_time);
      const calendarUrl = generateGoogleCalendarUrl({
        title: reminder_text,
        startDate: startDate,
        description: `Reminder: ${reminder_text}`,
        isRecurring: is_recurring,
        recurrencePattern: recurrence_pattern,
        recipientPhone: recipient_phone,
        smsMessage: smsMessage
      });
      
      db.run(
        'INSERT INTO reminders (id, response_id, reminder_type, item_index, question_index, reminder_time, sender_phone, recipient_name, reminder_text, is_recurring, recurrence_pattern, recipient_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, response_id, reminder_type, item_index || null, question_index || null, reminder_time, sender_phone, recipient_name, reminder_text, is_recurring ? 1 : 0, recurrence_pattern || null, recipient_phone || null],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ id, success: true, calendar_url: calendarUrl });
        }
      );
    }
  );
});

// Get all reminders for all check-ins (for dashboard) - only for authenticated user's check-ins
// IMPORTANT: This route must come BEFORE /api/reminders/:phone to avoid route conflicts
app.get('/api/reminders/all', authenticateToken, (req, res) => {
  console.log('GET /api/reminders/all called');
  db.all(
    `SELECT r.*, resp.checkin_id, c.recipient_name as checkin_recipient_name
     FROM reminders r
     LEFT JOIN responses resp ON r.response_id = resp.id
     LEFT JOIN checkins c ON resp.checkin_id = c.id
     WHERE c.user_id = ?
     ORDER BY r.reminder_time ASC`,
    [req.user.id],
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

// Get reminder calendar URL (requires authentication and ownership verification)
app.get('/api/reminder/:id/calendar', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT r.*, resp.answers, c.questions FROM reminders r
     JOIN responses resp ON r.response_id = resp.id
     JOIN checkins c ON resp.checkin_id = c.id
     WHERE r.id = ? AND c.user_id = ?`,
    [id, req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Reminder not found or access denied' });
      }
      
      // Generate SMS message based on reminder type
      let smsMessage = '';
      if (row.recipient_phone) {
        if (row.reminder_type === 'item' && row.question_index !== null && row.item_index !== null) {
          try {
            const answers = JSON.parse(row.answers);
            const item = answers[row.question_index]?.[row.item_index] || '';
            if (item) {
              smsMessage = `How is ${item}?`;
            }
          } catch (e) {
            console.error('Error parsing answers for SMS:', e);
          }
        } else if (row.reminder_type === 'full') {
          smsMessage = `How are you doing?`;
        }
      }
      
      const startDate = new Date(row.reminder_time);
      const calendarUrl = generateGoogleCalendarUrl({
        title: row.reminder_text,
        startDate: startDate,
        description: `Reminder: ${row.reminder_text}`,
        isRecurring: row.is_recurring === 1 || row.is_recurring === true,
        recurrencePattern: row.recurrence_pattern,
        recipientPhone: row.recipient_phone,
        smsMessage: smsMessage
      });
      
      res.json({ calendar_url: calendarUrl });
    }
  );
});

// Get reminders for a response (requires authentication and ownership verification)
app.get('/api/response/:id/reminders', authenticateToken, (req, res) => {
  const { id } = req.params;
  // Verify ownership first
  db.get(
    `SELECT c.user_id FROM responses r
     JOIN checkins c ON r.checkin_id = c.id
     WHERE r.id = ?`,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Response not found' });
      }
      if (row.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get reminders
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
    }
  );
});

// Removed: Get reminders by phone endpoint (no longer using SMS/Twilio)

// Update reminder (requires authentication and ownership verification)
app.put('/api/reminder/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { reminder_time, reminder_text, is_recurring, recurrence_pattern } = req.body;
  
  // Verify ownership first and get reminder data for SMS generation
  db.get(
    `SELECT r.*, resp.answers, c.questions FROM reminders r
     JOIN responses resp ON r.response_id = resp.id
     JOIN checkins c ON resp.checkin_id = c.id
     WHERE r.id = ? AND c.user_id = ?`,
    [id, req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Reminder not found or access denied' });
      }

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
          
          // Generate SMS message based on reminder type
          let smsMessage = '';
          if (row.recipient_phone) {
            if (row.reminder_type === 'item' && row.question_index !== null && row.item_index !== null) {
              try {
                const answers = JSON.parse(row.answers);
                const item = answers[row.question_index]?.[row.item_index] || '';
                if (item) {
                  smsMessage = `How is ${item}?`;
                }
              } catch (e) {
                console.error('Error parsing answers for SMS:', e);
              }
            } else if (row.reminder_type === 'full') {
              smsMessage = `How are you doing?`;
            }
          }
          
          // Generate updated calendar URL
          const startDate = new Date(reminder_time);
          const calendarUrl = generateGoogleCalendarUrl({
            title: reminder_text,
            startDate: startDate,
            description: `Reminder: ${reminder_text}`,
            isRecurring: is_recurring,
            recurrencePattern: recurrence_pattern,
            recipientPhone: row.recipient_phone,
            smsMessage: smsMessage
          });
          
          res.json({ success: true, calendar_url: calendarUrl });
        }
      );
    }
  );
});

// Delete reminder (requires authentication and ownership verification)
app.delete('/api/reminder/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Verify ownership first
  db.get(
    `SELECT r.id FROM reminders r
     JOIN responses resp ON r.response_id = resp.id
     JOIN checkins c ON resp.checkin_id = c.id
     WHERE r.id = ? AND c.user_id = ?`,
    [id, req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Reminder not found or access denied' });
      }

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
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

