import dayjs from 'dayjs';

export function formatDate(date: Date, mask = 'MM-DD-YYYY HH:mm') {
  return dayjs(date).format(mask);
}
