import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const createCheckin = async (intro, questions, senderEmail, recipientName, senderName, senderPhone) => {
  const response = await axios.post(`${API_BASE_URL}/checkin`, {
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
  const response = await axios.get(`${API_BASE_URL}/checkin/${id}`);
  return response.data;
};

export const submitResponse = async (checkinId, recipientName, answers) => {
  const response = await axios.post(`${API_BASE_URL}/response`, {
    checkin_id: checkinId,
    recipient_name: recipientName,
    answers
  });
  return response.data;
};

export const getResponses = async (checkinId) => {
  const response = await axios.get(`${API_BASE_URL}/checkin/${checkinId}/responses`);
  return response.data;
};

export const createReminder = async (reminderData) => {
  const response = await axios.post(`${API_BASE_URL}/reminder`, reminderData);
  return response.data;
};

export const getReminders = async (responseId) => {
  const response = await axios.get(`${API_BASE_URL}/response/${responseId}/reminders`);
  return response.data;
};

export const getAllCheckins = async () => {
  const response = await axios.get(`${API_BASE_URL}/checkins`);
  return response.data;
};

export const getAllReminders = async () => {
  const response = await axios.get(`${API_BASE_URL}/reminders/all`);
  return response.data;
};

export const updateReminder = async (reminderId, reminderData) => {
  const response = await axios.put(`${API_BASE_URL}/reminder/${reminderId}`, reminderData);
  return response.data;
};

export const deleteReminder = async (reminderId) => {
  const response = await axios.delete(`${API_BASE_URL}/reminder/${reminderId}`);
  return response.data;
};

export const getReminderCalendarUrl = async (reminderId) => {
  const response = await axios.get(`${API_BASE_URL}/reminder/${reminderId}/calendar`);
  return response.data.calendar_url;
};

