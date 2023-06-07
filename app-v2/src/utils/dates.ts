import dayjs from "dayjs";
import Timeago from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import customParseFormatPlugin from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormatPlugin);
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

function isValidISODate(input: unknown) {
  if (!input || typeof input !== "string") return false;

  // DayJS has a bug with strict parsing with timezones https://github.com/iamkun/dayjs/issues/929
  // So I'll just strip the "Z" timezone
  return input.endsWith("Z") && dayjs(input.slice(0, -1), "YYYY-MM-DDTHH:mm:ss.SSS", true).isValid();
}

function traverseTransform(input: unknown, transformation: (i: unknown) => unknown): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => traverseTransform(item, transformation));
  }

  if (input !== null && typeof input === "object") {
    return Object.fromEntries(
      Object.keys(input).map((key) => [
        key,
        traverseTransform(input[key as keyof typeof input], transformation),
      ])
    );
  }

  return transformation(input);
}

export function transformDates(input: unknown) {
  return traverseTransform(input, (val) => (isValidISODate(val) ? new Date(val as string) : val));
}

export { timeago, durationBetween, convertToUTC };
