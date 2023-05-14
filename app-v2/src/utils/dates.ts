import Timeago from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

Timeago.addDefaultLocale(en);
const timeago = new Timeago("en-US");

function durationBetween(start: Date, end: Date) {
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

function convertToUTC(date: Date) {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export { timeago, durationBetween, convertToUTC };
