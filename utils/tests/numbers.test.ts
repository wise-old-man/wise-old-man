import { round } from '../lib/numbers';

describe('Util - Numbers', () => {
  test('round', () => {
    expect(round(12.34567, 2)).toBe(12.35);
    expect(round(12.34567, 1)).toBe(12.3);
    expect(round(-5.6657, 0)).toBe(-6);
  });
});
