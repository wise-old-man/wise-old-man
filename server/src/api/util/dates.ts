import moment from 'moment';

// TODO: This should be removed after TS migration is done
// and we're using Date types for the other methods in this file
function castToDate(date) {
  return date instanceof Date ? date : new Date(date);
}

function isValidDate(date) {
  return date && moment(date, moment.ISO_8601).isValid();
}

function isPast(date) {
  return castToDate(date) < new Date();
}

function durationBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  const diff = endDate - startDate;

  if (diff === 0) {
    return '0 seconds';
  }

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  seconds = Math.floor(diff / 1000);
  minutes = Math.floor(seconds / 60);
  seconds %= 60;
  hours = Math.floor(minutes / 60);
  minutes %= 60;
  days = Math.floor(hours / 24);
  hours %= 24;

  const periods = [];

  if (days > 0) {
    periods.push(`${days} days`);
  }

  if (hours > 0) {
    periods.push(`${hours} hours`);
  }

  if (minutes > 0) {
    periods.push(`${minutes} minutes`);
  }

  if (seconds > 0) {
    periods.push(`${seconds} seconds`);
  }

  const str = periods.join(', ');

  if (str === '7 days') {
    return '1 week';
  }

  return str;
}

function getSeconds(period: string) {
  switch (period) {
    case '6h':
      return 3600 * 6;
    case 'day':
      return 3600 * 24;
    case 'week':
      return 3600 * 24 * 7;
    case 'month':
      return 3600 * 24 * 31;
    case 'year':
      return 31556926;
    default:
      return -1;
  }
}

export { isValidDate, isPast, durationBetween, getSeconds };
