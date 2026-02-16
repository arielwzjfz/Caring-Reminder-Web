import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResponses, createReminder, getReminders, getCheckin, getReminderCalendarUrl } from '../api';
import './CareReport.css';

function CareReport() {
  const { checkinId } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderType, setReminderType] = useState(null); // 'item' or 'full'
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [reminderTime, setReminderTime] = useState('');
  const [checkinPhone, setCheckinPhone] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reminders, setReminders] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [quickTimeSelected, setQuickTimeSelected] = useState(null);
  const [itemReminders, setItemReminders] = useState({}); // Track reminders for each item

  const fetchRemindersForResponse = async (responseId) => {
    try {
      const reminderData = await getReminders(responseId);
      setReminders(reminderData);
      console.log(reminderData);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch checkin data to get sender phone
        const checkinData = await getCheckin(checkinId);
        setCheckinPhone(checkinData.sender_phone || '');
        
        // Fetch responses
        const data = await getResponses(checkinId);
        setResponses(data);
        if (data.length > 0) {
          setSelectedResponse(data[0]);
          // Fetch reminders for the first response
          fetchRemindersForResponse(data[0].id);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied. This check-in belongs to another user.');
        } else {
          setError('Failed to load data');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [checkinId]);

  useEffect(() => {
    if (selectedResponse) {
      fetchRemindersForResponse(selectedResponse.id);
    }
  }, [selectedResponse]);

  // Load item-specific reminders
  useEffect(() => {
    if (reminders.length > 0 && selectedResponse) {
      const itemRemindersMap = {};
      reminders.forEach(reminder => {
        if (reminder.reminder_type === 'item' && reminder.question_index !== null && reminder.item_index !== null) {
          const key = `${reminder.question_index}-${reminder.item_index}`;
          itemRemindersMap[key] = reminder;
        }
      });
      setItemReminders(itemRemindersMap);
    }
  }, [reminders, selectedResponse]);

  const handleSetReminder = (type, questionIndex = null, itemIndex = null) => {
    setReminderType(type);
    setSelectedQuestionIndex(questionIndex);
    setSelectedItemIndex(itemIndex);
    setShowReminderModal(true);
    setError('');
    setSuccess('');
    setQuickTimeSelected(null);
    setReminderTime('');
    setIsRecurring(false);
    
    // Auto-fill phone number from existing reminders for this recipient
    if (selectedResponse && reminders.length > 0) {
      const existingReminder = reminders.find(r => r.recipient_phone);
      if (existingReminder && existingReminder.recipient_phone) {
        setRecipientPhone(existingReminder.recipient_phone);
      } else {
        setRecipientPhone('');
      }
    } else {
      setRecipientPhone('');
    }
  };

  const handleQuickTimeSelect = (days) => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    
    // Set to same time as now, or default to 9 AM if it's early
    const hours = now.getHours();
    if (hours < 8) {
      futureDate.setHours(9, 0, 0, 0);
    } else {
      futureDate.setHours(hours, now.getMinutes(), 0, 0);
    }
    
    const isoString = futureDate.toISOString().slice(0, 16);
    setReminderTime(isoString);
    setQuickTimeSelected(days);
  };

  const handleSubmitReminder = async (e) => {
    e.preventDefault();
    
    if (!reminderTime) {
      setError('Please select a reminder time');
      return;
    }

    setError('');
    setSuccess('');

    try {
      let reminderText = '';
      
      const recipientName = selectedResponse.checkin_recipient_name || selectedResponse.recipient_name;
      if (reminderType === 'full') {
        reminderText = `Check in with ${recipientName} about their care report`;
      } else {
        const item = selectedResponse.answers[selectedQuestionIndex]?.[selectedItemIndex] || '';
        reminderText = `Check in with ${recipientName} about ${item}`;
      }

      const result = await createReminder({
        response_id: selectedResponse.id,
        reminder_type: reminderType,
        item_index: selectedItemIndex,
        question_index: selectedQuestionIndex,
        reminder_time: new Date(reminderTime).toISOString(),
        sender_phone: checkinPhone || '', // Keep for backward compatibility but not required
        recipient_name: selectedResponse.checkin_recipient_name || selectedResponse.recipient_name,
        recipient_phone: recipientPhone || null,
        reminder_text: reminderText,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null
      });

      setSuccess('Reminder created! Click the button below to add it to your Google Calendar.');
      setShowReminderModal(false);
      setReminderTime('');
      setIsRecurring(false);
      setQuickTimeSelected(null);
      
      // Store calendar URL for display
      if (result.calendar_url) {
        // Open calendar in new tab
        window.open(result.calendar_url, '_blank');
      }
      
      // Refresh reminders
      if (selectedResponse) {
        await fetchRemindersForResponse(selectedResponse.id);
      }
    } catch (err) {
      setError('Failed to set reminder. Please try again.');
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

  if (responses.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Responses Yet 📭</h1>
          <p style={{ color: 'var(--muted)', fontSize: '26px' }}>Responses will appear here when people fill out your check-in.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: 0 }}>Care Report 💌</h1>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: '20px' }}>
                ← Dashboard
              </button>
            </Link>
          </div>
          
          {responses.length > 1 && (
            <div className="response-selector">
              <label>Select a response:</label>
              <select
                value={selectedResponse?.id || ''}
                onChange={async (e) => {
                  const response = responses.find(r => r.id === e.target.value);
                  setSelectedResponse(response);
                  if (response) {
                    await fetchRemindersForResponse(response.id);
                  }
                }}
              >
                {responses.map((response) => (
                  <option key={response.id} value={response.id}>
                    {response.recipient_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedResponse && (
            <div className="care-report">
            <div className="care-report-header">
              <h2>{selectedResponse.checkin_recipient_name || selectedResponse.recipient_name}</h2>
            </div>

              {selectedResponse.questions && selectedResponse.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="answer-section">
                  <h3>{question}</h3>
                  <ul className="answer-list">
                  {selectedResponse.answers[questionIndex]?.map((item, itemIndex) => {
                    const reminderKey = `${questionIndex}-${itemIndex}`;
                    const itemReminder = itemReminders[reminderKey];
                    const hasReminder = itemReminder && !itemReminder.sent;
                    
                    return (
                      <li key={itemIndex} className="answer-item">
                        <span>{item}</span>
                        {hasReminder ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="reminder-time-display" style={{
                              color: 'var(--olive)',
                              fontSize: '20px',
                              fontFamily: "'Caveat', cursive"
                            }}>
                              🕰️ {new Date(itemReminder.reminder_time).toLocaleDateString()} {new Date(itemReminder.reminder_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              {itemReminder.is_recurring && ' (recurring)'}
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  const calendarUrl = await getReminderCalendarUrl(itemReminder.id);
                                  window.open(calendarUrl, '_blank');
                                } catch (err) {
                                  console.error('Failed to get calendar URL:', err);
                                }
                              }}
                              className="reminder-btn-small"
                              style={{ fontSize: '18px', padding: '6px 12px' }}
                            >
                              📅 Add to Calendar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSetReminder('item', questionIndex, itemIndex)}
                            className="reminder-btn-small"
                          >
                            🕰️ Remind me
                          </button>
                        )}
                      </li>
                    );
                  })}
                  </ul>
                </div>
              ))}

              <div className="reminder-section">
                <button
                  onClick={() => handleSetReminder('full')}
                  className="reminder-btn"
                >
                  🕰️ Set Reminder for Entire Report
                </button>
                
                {reminders.length > 0 && (
                  <div className="reminders-list" style={{ marginTop: '32px' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--olive)' }}>Reminders 🕰️</h3>
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="reminder-item-display" style={{
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Set Reminder 🕰️</h2>
            <form onSubmit={handleSubmitReminder}>
              <div className="form-group">
                <label>Quick Options</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect(1)}
                    className={quickTimeSelected === 1 ? 'btn-secondary' : 'add-btn'}
                    style={{ fontSize: '20px' }}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect(7)}
                    className={quickTimeSelected === 7 ? 'btn-secondary' : 'add-btn'}
                    style={{ fontSize: '20px' }}
                  >
                    Next Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect(14)}
                    className={quickTimeSelected === 14 ? 'btn-secondary' : 'add-btn'}
                    style={{ fontSize: '20px' }}
                  >
                    In 2 Weeks
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reminder-time">Reminder Time</label>
                <input
                  id="reminder-time"
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => {
                    setReminderTime(e.target.value);
                    setQuickTimeSelected(null);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipient-phone">Recipient Phone Number</label>
                <input
                  id="recipient-phone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+1234567890 (with country code)"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    fontSize: '20px',
                    fontFamily: "'Caveat', cursive",
                    width: '100%'
                  }}
                />
                <small style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '4px', display: 'block' }}>
                  This phone number will be saved for future reminders to this person
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span>Make this recurring</span>
                </label>
                {isRecurring && (
                  <select
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value)}
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
              {success && <div className="success-message">{success}</div>}

              <div className="modal-actions">
                <button type="submit">Set Reminder</button>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CareReport;

