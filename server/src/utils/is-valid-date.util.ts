import dayjs from 'dayjs';

export function isValidDate(dateString: string) {
  return dateString && dayjs(dateString).isValid();
}
