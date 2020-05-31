import * as moment from 'moment'

function castToDate(date) {
  return date instanceof Date ? date : new Date(date);
}

function isValidDate(date) {
  return date && moment(date, moment.ISO_8601).isValid();
}

function isPast(date) {
  return castToDate(date) < new Date();
}

function isFuture(date) {
  return castToDate(date) > new Date();
}

function isAfter(a, b) {
  return castToDate(a) > castToDate(b);
}

function isBefore(a, b) {
  return castToDate(a) < castToDate(b);
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

export { isValidDate, isPast, isFuture, isAfter, isBefore, durationBetween }