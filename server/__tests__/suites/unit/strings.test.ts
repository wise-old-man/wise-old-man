import { formatNumber, padNumber, round } from '../../../src/utils';

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
    expect(formatNumber(12_523, true)).toBe('12.52k');
    expect(formatNumber(9_123_000, true)).toBe('9123k');
    expect(formatNumber(10_000_000, true)).toBe('10m');
    expect(formatNumber(-10_500_000, true)).toBe('-10.50m');
    expect(formatNumber(1_123_456_000, true)).toBe('1.12b');
    expect(formatNumber(-5_567_175_000, true)).toBe('-5.57b');
    expect(formatNumber(10_000_000_000, true)).toBe('10b');

    expect(formatNumber(3456, true, 3)).toBe('3,456');
    expect(formatNumber(10_564, true, 3)).toBe('10.564k');
    expect(formatNumber(10_000, true, 3)).toBe('10k');
    expect(formatNumber(200_453, true, 3)).toBe('200.453k');
    expect(formatNumber(10_000_000, true, 3)).toBe('10m');
    expect(formatNumber(12_967_712, true, 3)).toBe('12.968m');
    expect(formatNumber(2_436_267_123, true, 3)).toBe('2.436b');
  });

  test('padNumber', () => {
    expect(padNumber(0)).toBe('00');
    expect(padNumber(1)).toBe('01');
    expect(padNumber(10)).toBe('10');
    expect(padNumber(123)).toBe('123');
  });

  test('round', () => {
    expect(round(12.34567, 2)).toBe(12.35);
    expect(round(12.34567, 1)).toBe(12.3);
    expect(round(-5.6657, 0)).toBe(-6);
  });
});
