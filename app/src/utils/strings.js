export function capitalize(str) {
  if (!str) {
    return null;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function padNumber(value) {
  if (!value) {
    return '00';
  }

  return value < 10 ? `0${value}` : value;
}
