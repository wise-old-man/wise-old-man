import { formatNumber, padNumber } from '../lib/strings';

describe('Util - Strings', () => {
  test('formatNumber', () => {
    expect(formatNumber(1.234)).toBe('1.23');
    expect(formatNumber(5.1)).toBe('5.1');

    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(10_000)).toBe('10,000');
    expect(formatNumber(100_000)).toBe('100,000');
    expect(formatNumber(1_000_000)).toBe('1,000,000');

    expect(formatNumber(-1000, true)).toBe('-1,000');
    expect(formatNumber(10_000, true)).toBe('10k');
    expect(formatNumber(9_123_000, true)).toBe('9123k');
    expect(formatNumber(-10_500_000, true)).toBe('-10.5m');
    expect(formatNumber(1_123_456_000, true)).toBe('1.12b');
  });

  test('padNumber', () => {
    expect(padNumber(0)).toBe('00');
    expect(padNumber(1)).toBe('01');
    expect(padNumber(10)).toBe('10');
    expect(padNumber(123)).toBe('123');
  });
});
