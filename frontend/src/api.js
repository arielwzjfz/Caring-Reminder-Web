import axios from 'axios';
import { getToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000 // 10 second timeout
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const signup = async (email, password, name) => {
  const response = await api.post('/auth/signup', { email, password, name });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const createCheckin = async (intro, questions, senderEmail, recipientName, senderName, senderPhone) => {
  const response = await api.post('/checkin', {
    intro,
    questions,
    sender_email: senderEmail,
    recipient_name: recipientName,
    sender_name: senderName,
    sender_phone: senderPhone
  });
  return response.data;
};

export const getCheckin = async (id) => {
  const response = await api.get(`/checkin/${id}`);
  return response.data;
};

export const submitResponse = async (checkinId, recipientName, answers) => {
  const response = await api.post('/response', {
    checkin_id: checkinId,
    recipient_name: recipientName,
    answers
  });
  return response.data;
};

export const getResponses = async (checkinId) => {
  const response = await api.get(`/checkin/${checkinId}/responses`);
  return response.data;
};

export const createReminder = async (reminderData) => {
  const response = await api.post('/reminder', reminderData);
  return response.data;
};

export const getReminders = async (responseId) => {
  const response = await api.get(`/response/${responseId}/reminders`);
  return response.data;
};

export const getAllCheckins = async () => {
  const response = await api.get('/checkins');
  return response.data;
};

export const getAllReminders = async () => {
  const response = await api.get('/reminders/all');
  return response.data;
};

export const updateReminder = async (reminderId, reminderData) => {
  const response = await api.put(`/reminder/${reminderId}`, reminderData);
  return response.data;
};

export const deleteReminder = async (reminderId) => {
  const response = await api.delete(`/reminder/${reminderId}`);
  return response.data;
};

export const getReminderCalendarUrl = async (reminderId) => {
  const response = await api.get(`/reminder/${reminderId}/calendar`);
  return response.data.calendar_url;
};

