import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllCheckins, getAllReminders, getResponses, updateReminder, deleteReminder, getReminderCalendarUrl } from '../api';
import './Dashboard.css';

function Dashboard() {
  const location = useLocation();
  const [checkins, setCheckins] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [checkinsWithResponses, setCheckinsWithResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReminder, setEditingReminder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReminderTime, setEditReminderTime] = useState('');
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [editRecurrencePattern, setEditRecurrencePattern] = useState('weekly');
  const [editQuickTimeSelected, setEditQuickTimeSelected] = useState(null);
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const fetchData = async () => {
    try {
      const [checkinsData, remindersData] = await Promise.all([
        getAllCheckins(),
        getAllReminders()
      ]);
      
      console.log('getAllReminders results:', remindersData);
      
      setCheckins(checkinsData);
      setReminders(remindersData || []);
      
      // Get check-ins that have responses (for care reports)
      const checkinsWithResps = await Promise.all(
        checkinsData.map(async (checkin) => {
          try {
            const responses = await getResponses(checkin.id);
            return { ...checkin, hasResponses: responses.length > 0 };
          } catch {
            return { ...checkin, hasResponses: false };
          }
        })
      );
      
      setCheckinsWithResponses(checkinsWithResps.filter(c => c.hasResponses));
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]); // Refresh when route changes (including when navigating to dashboard)
  
  useEffect(() => {
    // Also refresh when window comes into focus
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    const reminderDate = new Date(reminder.reminder_time);
    const isoString = reminderDate.toISOString().slice(0, 16);
    setEditReminderTime(isoString);
    setEditIsRecurring(reminder.is_recurring === 1 || reminder.is_recurring === true);
    setEditRecurrencePattern(reminder.recurrence_pattern || 'weekly');
    setEditQuickTimeSelected(null);
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await deleteReminder(reminderId);
      setSuccess('Reminder deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete reminder. Please try again.');
      console.error(err);
    }
  };

  const handleQuickTimeSelect = (days) => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    
    const hours = now.getHours();
    if (hours < 8) {
      futureDate.setHours(9, 0, 0, 0);
    } else {
      futureDate.setHours(hours, now.getMinutes(), 0, 0);
    }
    
    const isoString = futureDate.toISOString().slice(0, 16);
    setEditReminderTime(isoString);
    setEditQuickTimeSelected(days);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!editReminderTime) {
      setError('Please select a reminder time');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await updateReminder(editingReminder.id, {
        reminder_time: new Date(editReminderTime).toISOString(),
        reminder_text: editingReminder.reminder_text,
        is_recurring: editIsRecurring,
        recurrence_pattern: editIsRecurring ? editRecurrencePattern : null
      });

      setSuccess('Reminder updated successfully!');
      setShowEditModal(false);
      setEditingReminder(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update reminder. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: 0 }}>My Check-ins 🍵</h1>
          <Link to="/create" style={{ textDecoration: 'none' }}>
            <button style={{ fontSize: '22px' }}>✨ Create New Check-in</button>
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{ background: 'var(--olive)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}

        {/* My Check-ins Section - Shows all reminders from different people's care reports */}
        {reminders.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: 'var(--olive)' }}>My Reminders 🕰️</h2>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="btn-secondary"
                style={{ fontSize: '20px' }}
              >
                {isEditMode ? '✓ Done' : '✏️ Edit'}
              </button>
            </div>
            <div className="reminders-list-dashboard">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-item-dashboard" style={{
                  background: 'var(--highlight)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ color: 'var(--text)', fontSize: '24px', lineHeight: '1.4', flex: 1 }}>
                    {reminder.reminder_text} at {new Date(reminder.reminder_time).toLocaleDateString()}, {new Date(reminder.reminder_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {reminder.is_recurring && ` (recurring ${reminder.recurrence_pattern})`}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={async () => {
                        try {
                          const calendarUrl = await getReminderCalendarUrl(reminder.id);
                          window.open(calendarUrl, '_blank');
                        } catch (err) {
                          console.error('Failed to get calendar URL:', err);
                        }
                      }}
                      className="btn-secondary"
                      style={{ fontSize: '18px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                    >
                      📅 Add to Calendar
                    </button>
                    {isEditMode && (
                      <>
                        <button
                          onClick={() => handleEditReminder(reminder)}
                          className="btn-secondary"
                          style={{ fontSize: '18px', padding: '8px 16px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="btn-secondary"
                          style={{ fontSize: '18px', padding: '8px 16px', background: '#d32f2f', color: 'white' }}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reminders.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '26px', marginBottom: '40px' }}>
            <p>No reminders set yet. Set reminders in your care reports to see them here.</p>
          </div>
        )}

        {/* Care Reports Section */}
        {checkinsWithResponses.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--olive)' }}>Care Reports 💌</h2>
            <div className="care-reports-grid">
              {checkinsWithResponses.map((checkin) => (
                <Link 
                  key={checkin.id} 
                  to={`/report/${checkin.id}`}
                  className="care-report-letter"
                >
                  <div className="letter-envelope">
                    <div className="letter-content">
                      <h3 style={{ color: 'var(--olive)', margin: 0, fontSize: '28px' }}>
                        {checkin.recipient_name || 'Someone'}'s Care Report
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {checkins.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '26px' }}>
            <p>No check-ins yet. Create your first one!</p>
          </div>
        )}
      </div>

      {showEditModal && editingReminder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Reminder 🕰️</h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Quick Options</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect(1)}
                    className={editQuickTimeSelected === 1 ? 'btn-secondary' : 'add-btn'}
                    style={{ fontSize: '20px' }}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect(7)}
                    className={editQuickTimeSelected === 7 ? 'btn-secondary' : 'add-btn'}
                    style={{ fontSize: '20px' }}
                  >
                    Next Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect(14)}
                    className={editQuickTimeSelected === 14 ? 'btn-secondary' : 'add-btn'}
                    style={{ fontSize: '20px' }}
                  >
                    In 2 Weeks
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-reminder-time">Reminder Time</label>
                <input
                  id="edit-reminder-time"
                  type="datetime-local"
                  value={editReminderTime}
                  onChange={(e) => {
                    setEditReminderTime(e.target.value);
                    setEditQuickTimeSelected(null);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editIsRecurring}
                    onChange={(e) => setEditIsRecurring(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span>Make this recurring</span>
                </label>
                {editIsRecurring && (
                  <select
                    value={editRecurrencePattern}
                    onChange={(e) => setEditRecurrencePattern(e.target.value)}
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      fontSize: '22px',
                      fontFamily: "'Caveat', cursive",
                      width: '100%'
                    }}
                  >
                    <option value="weekly">Every week</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Every month</option>
                  </select>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message" style={{ background: 'var(--olive)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}

              <div className="modal-actions">
                <button type="submit">Update Reminder</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReminder(null);
                    setError('');
                    setSuccess('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

