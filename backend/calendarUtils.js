/**
 * Generate Google Calendar URL for creating an event
 * @param {Object} options - Event options
 * @param {string} options.title - Event title
 * @param {Date} options.startDate - Start date/time
 * @param {Date} options.endDate - End date/time (defaults to startDate + 1 hour)
 * @param {string} options.description - Event description
 * @param {boolean} options.isRecurring - Whether event is recurring
 * @param {string} options.recurrencePattern - 'weekly', 'biweekly', or 'monthly'
 * @returns {string} Google Calendar URL
 */
function generateGoogleCalendarUrl({ title, startDate, endDate, description, isRecurring, recurrencePattern }) {
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

  // Build base URL
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: description || ''
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

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

module.exports = { generateGoogleCalendarUrl };

