import { Competition, Participation } from '../../../prisma';

export interface CompetitionWithCount extends Omit<Competition, 'verificationHash'> {
  participantCount: number;
}

export interface ParticipationWithCompetition
  extends Omit<Participation, 'startSnapshotId' | 'endSnapshotId'> {
  competition: CompetitionWithCount;
}
