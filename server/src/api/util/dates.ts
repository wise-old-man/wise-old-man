import moment from 'moment';

function formatDate(date: Date, mask = 'MM-DD-YYYY HH:mm') {
  return moment(date).format(mask);
}

function isValidDate(date) {
  return date && moment(date, moment.ISO_8601).isValid();
}

export { formatDate, isValidDate };
