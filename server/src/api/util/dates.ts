import dayjs from 'dayjs';

function formatDate(date: Date, mask = 'MM-DD-YYYY HH:mm') {
  return dayjs(date).format(mask);
}

function isValidDate(dateString: string) {
  return dateString && dayjs(dateString).isValid();
}

export { formatDate, isValidDate };
