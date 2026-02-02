import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCheckin } from '../api';
import './CreateCheckin.css';

const DEFAULT_INTRO = `Hi 🤍
I'm trying to be more intentional about showing care and staying connected.
These questions help me understand what matters to you right now.
There's no pressure to answer perfectly—share as much or as little as you want.`;

const DEFAULT_QUESTIONS = [
  '🪴 What have you been working on recently?',
  '🎯 What are some goals you have right now?',
  '📞 When are you usually free to call or hang out?'
];

function CreateCheckin() {
  const [intro, setIntro] = useState(DEFAULT_INTRO);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [checkinLink, setCheckinLink] = useState('');
  const [checkinId, setCheckinId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  // Auto-resize textarea on mount and when intro changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [intro]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const filteredQuestions = questions.filter(q => q.trim() !== '');
      if (filteredQuestions.length === 0) {
        setError('Please add at least one question');
        setLoading(false);
        return;
      }

      const result = await createCheckin(intro, filteredQuestions, null, recipientName, senderName, senderPhone);
      const fullLink = `${window.location.origin}${result.link}`;
      setCheckinLink(fullLink);
      setCheckinId(result.id);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create check-in. Please try again.';
      setError(errorMessage);
      console.error('Error creating check-in:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkinLink);
    alert('Link copied to clipboard!');
  };

  if (checkinLink) {
    return (
      <div className="container">
        <div className="card">
          <h1>Your Check-in is Ready! ✨</h1>
          <p style={{ marginBottom: '20px', color: 'var(--text)', fontSize: '26px' }}>Share this link with the people you care about:</p>
          <div className="link-display">
            <code>{checkinLink}</code>
          </div>
          <button onClick={handleCopyLink} className="copy-btn">
            Copy Link
          </button>
          <Link to={`/report/${checkinId}`} style={{ marginLeft: '12px', textDecoration: 'none' }}>
            <button className="btn-secondary">
              View Responses
            </button>
          </Link>
          <button 
            onClick={() => {
              setCheckinLink('');
              setCheckinId('');
              setIntro(DEFAULT_INTRO);
              setQuestions(DEFAULT_QUESTIONS);
              setRecipientName('');
              setSenderName('');
              setSenderPhone('');
              setSmsConsent(false);
            }} 
            className="btn-secondary"
            style={{ marginLeft: '12px' }}
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0 }}>Create a Caring Check-in 💌</h1>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ fontSize: '20px' }}>
              ← Dashboard
            </button>
          </Link>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipient-name">Name of the person you're sending this to</label>
            <input
              id="recipient-name"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter their name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sender-name">Your name</label>
            <input
              id="sender-name"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="intro">Your note 🤍</label>
            <textarea
              ref={textareaRef}
              id="intro"
              value={intro}
              onChange={(e) => {
                setIntro(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Write a message to introduce your check-in..."
            />
          </div>

          <div className="form-group">
            <label>Questions 📝</label>
            {questions.map((question, index) => (
              <div key={index} className="question-item">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="remove-btn"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="add-btn"
            >
              + Add Question
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="sender-phone">Your Phone Number (optional)</label>
            <input
              id="sender-phone"
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="Enter your phone number (optional)"
            />
            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  I agree to receive SMS reminders (optional)
                </span>
              </label>
              <p style={{ marginTop: '8px', marginLeft: '24px', fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
                Reminders will be added to your Google Calendar. SMS reminders are optional.
              </p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : '✨ Create Check-in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCheckin;

