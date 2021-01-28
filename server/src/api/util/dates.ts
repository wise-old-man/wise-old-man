import moment from 'moment';
import { PERIODS } from '../constants';

const CUSTOM_PERIOD_REGEX = /(\d+y)?(\d+m)?(\d+w)?(\d+d)?(\d+h)?/;

function parsePeriod(period: string): [string, number] | null {
  const fixed = period.toLowerCase();

  if (PERIODS.includes(fixed)) {
    return [fixed, getMilliseconds(fixed)];
  }

  const result = fixed.match(CUSTOM_PERIOD_REGEX);

  if (!result || result.length === 0 || result[0] !== fixed) {
    return null;
  }

  const years = result[1] ? parseInt(result[1].replace(/\D/g, '')) : null;
  const months = result[2] ? parseInt(result[2].replace(/\D/g, '')) : null;
  const weeks = result[3] ? parseInt(result[3].replace(/\D/g, '')) : null;
  const days = result[4] ? parseInt(result[4].replace(/\D/g, '')) : null;
  const hours = result[5] ? parseInt(result[5].replace(/\D/g, '')) : null;

  const yearsMs = years ? years * getMilliseconds('year') : 0;
  const monthsMs = months ? months * getMilliseconds('month') : 0;
  const weeksMs = weeks ? weeks * getMilliseconds('week') : 0;
  const daysMs = days ? days * getMilliseconds('day') : 0;
  const hoursMs = hours ? hours * getMilliseconds('hour') : 0;

  const totalMs = yearsMs + monthsMs + weeksMs + daysMs + hoursMs;

  return [result[0], totalMs];
}

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

function getMilliseconds(period: string) {
  switch (period) {
    case 'hour':
      return 3600 * 1000;
    case '6h':
      return 3600 * 6 * 1000;
    case 'day':
      return 3600 * 24 * 1000;
    case 'week':
      return 3600 * 24 * 7 * 1000;
    case 'month':
      return 3600 * 24 * 31 * 1000;
    case 'year':
      return 31556926 * 1000;
    default:
      return -1;
  }
}

export { parsePeriod, isValidDate, isPast, durationBetween, getMilliseconds };
