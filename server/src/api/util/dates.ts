import dayjs from 'dayjs';

export function formatDate(date: Date, mask = 'MM-DD-YYYY HH:mm') {
  return dayjs(date).format(mask);
}

export function isValidDate(dateString: string) {
  return dateString && dayjs(dateString).isValid();
}

export function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDatesInBetween(start: Date, end: Date) {
  const dates = [];

  let current = normalizeDate(start);
  while (current.getTime() <= normalizeDate(end).getTime()) {
    dates.push(current);
    current = new Date(current.getTime() + 1000 * 60 * 60 * 24);
  }

  return dates;
}
