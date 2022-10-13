import {
  isCompetitionStatus,
  isCompetitionType,
  CompetitionType,
  CompetitionStatus,
  CompetitionTypeProps,
  COMPETITION_TYPES,
  COMPETITION_STATUSES,
  CompetitionStatusProps
} from '../../../src/utils';

describe('Util - Competitions', () => {
  test('Props', () => {
    expect(COMPETITION_TYPES.some(t => !(t in CompetitionTypeProps))).toBe(false);
    expect(Object.keys(CompetitionType).length).toBe(Object.keys(CompetitionTypeProps).length);

    expect(COMPETITION_STATUSES.some(t => !(t in CompetitionStatusProps))).toBe(false);
    expect(Object.keys(CompetitionStatus).length).toBe(Object.keys(CompetitionStatusProps).length);
  });

  test('isCompetitionType', () => {
    expect(isCompetitionType('classic')).toBe(true);
    expect(isCompetitionType('team')).toBe(true);
    expect(isCompetitionType('other')).toBe(false);
  });

  test('findCompetitionStatus', () => {
    expect(isCompetitionStatus('upcoming')).toBe(true);
    expect(isCompetitionStatus('ongoing')).toBe(true);
    expect(isCompetitionStatus('finished')).toBe(true);
    expect(isCompetitionStatus('other')).toBe(false);
  });
});
