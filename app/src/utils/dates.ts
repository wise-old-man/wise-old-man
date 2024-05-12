import Timeago from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

Timeago.addDefaultLocale(en);

export const minDate = new Date(2013, 0, 1); // Jan 1, 2013

export const timeago = new Timeago("en-US");

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function durationBetween(start: Date, end: Date) {
  let msLeft = end.getTime() - start.getTime();

  if (msLeft <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const daysLeft = Math.floor(msLeft / 1000 / 60 / 60 / 24);
  msLeft -= daysLeft * 1000 * 60 * 60 * 24;

  const hoursLeft = Math.floor(msLeft / 1000 / 60 / 60);
  msLeft -= hoursLeft * 1000 * 60 * 60;

  const minutesLeft = Math.floor(msLeft / 1000 / 60);
  msLeft -= minutesLeft * 1000 * 60;

  const secondsLeft = Math.floor(msLeft / 1000);
  msLeft -= secondsLeft * 1000;

  return {
    days: daysLeft,
    hours: hoursLeft,
    minutes: minutesLeft,
    seconds: secondsLeft,
  };
}

export function convertToUTC(date: Date) {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function formatDatetime(date: Date, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return date.toLocaleString(undefined, options || defaultOptions);
}

export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return date.toLocaleString(undefined, options || defaultOptions);
}

export function isValidDate(dateString: string) {
  return !Number.isNaN(new Date(dateString).getTime());
}

export function isAfter2013(date: Date) {
  return date > minDate;
}
