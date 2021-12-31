import {
  findCompetitionType,
  findCompetitionStatus,
  CompetitionType,
  CompetitionStatus,
  CompetitionTypeProps,
  COMPETITION_TYPES,
  COMPETITION_STATUSES,
  CompetitionStatusProps
} from '../lib/competitions';

describe('Util - Competitions', () => {
  test('Props', () => {
    expect(COMPETITION_TYPES.some(t => !(t in CompetitionTypeProps))).toBe(false);
    expect(Object.keys(CompetitionType).length).toBe(Object.keys(CompetitionTypeProps).length);

    expect(COMPETITION_STATUSES.some(t => !(t in CompetitionStatusProps))).toBe(false);
    expect(Object.keys(CompetitionStatus).length).toBe(Object.keys(CompetitionStatusProps).length);
  });

  test('findCompetitionType', () => {
    expect(findCompetitionType('Classic')).toBe(CompetitionType.CLASSIC);
    expect(findCompetitionType('Team')).toBe(CompetitionType.TEAM);
    expect(findCompetitionType('Other')).toBe(null);
  });

  test('findCompetitionStatus', () => {
    expect(findCompetitionStatus('Upcoming')).toBe(CompetitionStatus.UPCOMING);
    expect(findCompetitionStatus('Ongoing')).toBe(CompetitionStatus.ONGOING);
    expect(findCompetitionStatus('Other')).toBe(null);
  });
});
