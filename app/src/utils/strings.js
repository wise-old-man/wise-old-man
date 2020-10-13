export function capitalize(str) {
  if (!str) {
    return null;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatNumber(num, withLetters = false) {
  if (num === undefined) {
    return -1;
  }

  // If number is float
  if (num % 1 !== 0) {
    return round(num, 2)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  if ((num < 10000 && num > -10000) || !withLetters) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  // < 10 million
  if (num < 10000000 && num > -10000000) {
    return `${Math.floor(num / 1000)}k`;
  }

  // < 1 billion
  if (num < 1000000000 && num > -1000000000) {
    return `${Math.round((num / 1000000 + Number.EPSILON) * 100) / 100}m`;
  }

  return `${Math.round((num / 1000000000 + Number.EPSILON) * 100) / 100}b`;
}

export function round(num, cases) {
  const x = 10 ** cases;
  return Math.round(num * x) / x;
}

export function padNumber(value) {
  if (!value) {
    return '00';
  }

  return value < 10 ? `0${value}` : value;
}

export function standardizeUsername(username) {
  if (!username) return null;

  return username
    .replace(/[-_\s]/g, ' ')
    .trim()
    .toLowerCase();
}
