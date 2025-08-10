export const CompetitionType = {
  CLASSIC: 'classic',
  TEAM: 'team'
} as const;

export type CompetitionType = (typeof CompetitionType)[keyof typeof CompetitionType];

export const COMPETITION_TYPES = Object.values(CompetitionType) as CompetitionType[];
