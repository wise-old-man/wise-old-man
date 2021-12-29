export function capitalize(string: string | null): string | null {
  if (!string) return null;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatNumber(num: number, withLetters = false) {
  if (num === undefined || num === null) return -1;

  // If number is float
  if (num % 1 !== 0) {
    return (Math.round(num * 100) / 100).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  if ((num < 10000 && num > -10000) || !withLetters) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  // < 10 million
  if (num < 10_000_000 && num > -10_000_000) {
    return `${Math.floor(num / 1000)}k`;
  }

  // < 1 billion
  if (num < 1_000_000_000 && num > -1_000_000_000) {
    return `${Math.round((num / 1000000 + Number.EPSILON) * 100) / 100}m`;
  }

  return `${Math.round((num / 1000000000 + Number.EPSILON) * 100) / 100}b`;
}

export function padNumber(value: number): string {
  if (!value) return '00';
  return value < 10 ? `0${value}` : value.toString();
}
