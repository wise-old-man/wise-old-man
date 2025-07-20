export const PlayerAnnotationType = {
  OPT_OUT: 'opt_out',
  OPT_OUT_GROUPS: 'opt_out_groups',
  OPT_OUT_COMPETITIONS: 'opt_out_competitions',
  BLOCKED: 'blocked',
  FAKE_F2P: 'fake_f2p'
} as const;

export type PlayerAnnotationType = (typeof PlayerAnnotationType)[keyof typeof PlayerAnnotationType];
