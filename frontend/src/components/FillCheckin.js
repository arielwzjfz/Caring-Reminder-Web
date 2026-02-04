import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCheckin, submitResponse } from '../api';
import './FillCheckin.css';

function FillCheckin() {
  const { id } = useParams();
  const [checkin, setCheckin] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const data = await getCheckin(id);
        setCheckin(data);
        // Initialize answers with 2 empty items per question
        setAnswers(data.questions.map(() => ['', '']));
      } catch (err) {
        setError('Check-in not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckin();
  }, [id]);

  const handleAnswerChange = (questionIndex, bulletIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex][bulletIndex] = value;
    setAnswers(newAnswers);
  };

  const handleAddBullet = (questionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex].push('');
    setAnswers(newAnswers);
  };

  const handleRemoveBullet = (questionIndex, bulletIndex) => {
    const newAnswers = [...answers];
    if (newAnswers[questionIndex].length > 1) {
      newAnswers[questionIndex] = newAnswers[questionIndex].filter((_, i) => i !== bulletIndex);
      setAnswers(newAnswers);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSubmitting(true);

    try {
      // Filter out empty items
      const filteredAnswers = answers.map(answerList => 
        answerList.filter(item => item.trim() !== '')
      );

      // Use recipient name from check-in or default
      const name = checkin.recipient_name || 'Someone';
      await submitResponse(id, name, filteredAnswers);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit your response. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
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

  if (error && !checkin) {
    return (
      <div className="container">
        <div className="card">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container">
        <div className="card">
          <h1>Thank you! 🤍</h1>
          <p style={{ color: 'var(--text)', fontSize: '26px' }}>Your response has been submitted. The person who sent this check-in will receive it.</p>
        </div>
      </div>
    );
  }

  // Format intro with recipient name and sender name
  const formatIntro = () => {
    const recipientName = checkin.recipient_name || '';
    const senderName = checkin.sender_name || '';
    let formattedIntro = checkin.intro;
    
    // Add "Hi [Recipient Name]" at the beginning if recipient name exists
    if (recipientName) {
      formattedIntro = `Hi ${recipientName},\n\n${formattedIntro}`;
    }
    
    // Add sender name at the end after the default text if it exists
    if (senderName) {
      formattedIntro = `${formattedIntro}\n\n${senderName}`;
    }
    
    return formattedIntro;
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>A few gentle questions 🌿</h2>
        
        <div className="intro-text">
          {formatIntro().split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {checkin.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="answer-section">
              <h3>{question}</h3>
              {answers[questionIndex]?.map((item, itemIndex) => (
                <div key={itemIndex} className="bullet-point">
                  <span className="bullet-number">🌱 Thing {itemIndex + 1}</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleAnswerChange(questionIndex, itemIndex, e.target.value)}
                    placeholder={`Thing ${itemIndex + 1}`}
                  />
                  {answers[questionIndex].length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(questionIndex, itemIndex)}
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
                onClick={() => handleAddBullet(questionIndex)}
                className="add-btn"
              >
                + Add more
              </button>
            </div>
          ))}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Complete'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FillCheckin;

