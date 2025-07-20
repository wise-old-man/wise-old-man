import { Country, COUNTRY_CODES } from '../../../src/types';
import { CountryProps, findCountry, findCountryByCode, findCountryByName } from '../../../src/utils/shared';

describe('Util - Countries', () => {
  test('Props', () => {
    expect(COUNTRY_CODES.some(c => !(c in CountryProps))).toBe(false);
    expect(Object.keys(Country).length).toBe(Object.keys(CountryProps).length);
  });

  test('findCountryByCode', () => {
    expect(findCountryByCode('UK')?.code).toBe('GB');
    expect(findCountryByCode('USA')?.code).toBe('US');
    expect(findCountryByCode('PT')?.name).toBe('Portugal');
    expect(findCountryByCode('FR')?.name).toBe('France');
  });

  test('findCountryByName', () => {
    expect(findCountryByName('portugal')?.code).toBe('PT');
    expect(findCountryByName('Italy')?.code).toBe('IT');
    expect(findCountryByName('ANGOLA')?.name).toBe('Angola');
  });

  test('findCountry', () => {
    expect(findCountry('portugal')?.code).toBe('PT');
    expect(findCountry('it')?.code).toBe('IT');
    expect(findCountry('AO')?.name).toBe('Angola');
  });
});
