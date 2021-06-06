import moment from 'moment';

const DEFAULT_DATE_MASK = 'MM-DD-YYYY HH:mm';

export function isValidDate(date) {
  return date && moment(date, moment.ISO_8601).isValid();
}

export function formatDate(date, mask = DEFAULT_DATE_MASK) {
  return moment(date).format(mask);
}

export function formatDateUTC(date, mask = DEFAULT_DATE_MASK) {
  return moment.utc(date).format(mask);
}

export function durationOf(diff) {
  if (diff <= 0) {
    return 0;
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

  return {
    days,
    hours,
    minutes,
    seconds
  };
}

export function durationBetween(startDate, endDate, maxDepth = 10, shortNames = false) {
  if (!startDate || !endDate) {
    return null;
  }

  const { days, hours, minutes, seconds } = durationOf(endDate - startDate);
  const periods = [];

  if (days > 0 && periods.length < maxDepth) {
    periods.push(`${days} days`);
  }

  if (hours > 0 && periods.length < maxDepth) {
    periods.push(`${hours} hours`);
  }

  if (minutes > 0 && periods.length < maxDepth) {
    periods.push(`${minutes} ${shortNames ? 'mins' : 'minutes'}`);
  }

  if (seconds > 0 && periods.length < maxDepth) {
    periods.push(`${seconds}  ${shortNames ? 'secs' : 'seconds'}`);
  }

  if (periods.length === 0) {
    return '0 seconds';
  }

  return periods.join(', ');
}
