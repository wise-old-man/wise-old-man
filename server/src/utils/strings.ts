function formatNumber(num: number, withLetters = false, decimalPrecision = 2) {
  if (num === undefined || num === null) return -1;

  // If number is float
  if (num % 1 !== 0) {
    return (Math.round(num * 100) / 100).toLocaleString();
  }

  if ((num < 10000 && num > -10000) || !withLetters) {
    return num.toLocaleString();
  }

  // < 100k
  if (num < 100_000 && num > -100_000) {
    // If has no decimals, return as whole number instead (10.00k => 10k)
    if ((num / 1000) % 1 === 0) return `${num / 1000}k`;

    return `${(num / 1000).toFixed(decimalPrecision)}k`;
  }

  // < 10 million
  if (num < 10_000_000 && num > -10_000_000) {
    return `${Math.round(num / 1000)}k`;
  }

  // < 1 billion
  if (num < 1_000_000_000 && num > -1_000_000_000) {
    // If has no decimals, return as whole number instead (10.00m => 10m)
    if ((num / 1_000_000) % 1 === 0) return `${num / 1_000_000}m`;

    return `${(num / 1_000_000).toFixed(decimalPrecision)}m`;
  }

  // If has no decimals, return as whole number instead (10.00b => 10b)
  if ((num / 1_000_000_000) % 1 === 0) return `${num / 1_000_000_000}b`;

  return `${(num / 1_000_000_000).toFixed(decimalPrecision)}b`;
}

function padNumber(value: number): string {
  if (!value) return '00';
  return value < 10 ? `0${value}` : value.toString();
}

function round(num: number, cases: number) {
  return Math.round(num * Math.pow(10, cases)) / Math.pow(10, cases);
}

export { formatNumber, padNumber, round };
