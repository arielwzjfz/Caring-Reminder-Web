/**
 * Generate SMS URL scheme for pre-filled message
 * @param {string} phoneNumber - Recipient phone number (with country code, e.g., +1234567890)
 * @param {string} message - Pre-filled message text
 * @returns {string} SMS URL
 */
function generateSmsUrl(phoneNumber, message) {
  if (!phoneNumber) return '';
  // Remove any spaces or dashes from phone number
  const cleanPhone = phoneNumber.replace(/[\s\-]/g, '');
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  return `sms:${cleanPhone}?body=${encodedMessage}`;
}

/**
 * Generate Google Calendar URL for creating an event
 * Opens in app on mobile if available, otherwise web
 * @param {Object} options - Event options
 * @param {string} options.title - Event title
 * @param {Date} options.startDate - Start date/time
 * @param {Date} options.endDate - End date/time (defaults to startDate + 1 hour)
 * @param {string} options.description - Event description
 * @param {boolean} options.isRecurring - Whether event is recurring
 * @param {string} options.recurrencePattern - 'weekly', 'biweekly', or 'monthly'
 * @param {string} options.recipientPhone - Recipient phone number for SMS link
 * @param {string} options.smsMessage - Pre-filled SMS message
 * @returns {string} Google Calendar URL
 */
function generateGoogleCalendarUrl({ title, startDate, endDate, description, isRecurring, recurrencePattern, recipientPhone, smsMessage }) {
  // Format dates as YYYYMMDDTHHMMSSZ (UTC)
  const formatDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  // Default end date to 1 hour after start
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const startStr = formatDate(startDate);
  const endStr = formatDate(end);

  // Build description with SMS link if available
  let fullDescription = description || '';
  if (recipientPhone && smsMessage) {
    const smsUrl = generateSmsUrl(recipientPhone, smsMessage);
    if (smsUrl) {
      fullDescription += (fullDescription ? '\n\n' : '') + `📱 Quick Message:\n${smsUrl}\n\nTap the link above to send: "${smsMessage}"`;
    }
  }

  // Use /r/eventedit which opens app on mobile if available, falls back to web
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: fullDescription
  });

  // Add recurrence rule if recurring
  if (isRecurring && recurrencePattern) {
    let rrule = '';
    switch (recurrencePattern) {
      case 'weekly':
        rrule = 'FREQ=WEEKLY;INTERVAL=1';
        break;
      case 'biweekly':
        rrule = 'FREQ=WEEKLY;INTERVAL=2';
        break;
      case 'monthly':
        rrule = 'FREQ=MONTHLY;INTERVAL=1';
        break;
      default:
        rrule = 'FREQ=WEEKLY;INTERVAL=1';
    }
    params.append('recur', `RRULE:${rrule}`);
  }

  // Use /r/eventedit which opens the app on mobile devices
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

module.exports = { generateGoogleCalendarUrl, generateSmsUrl };

