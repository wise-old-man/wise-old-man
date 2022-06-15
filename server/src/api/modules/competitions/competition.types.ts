import { Competition, Participation, Player } from '../../../prisma';

export interface CompetitionWithCount extends Omit<Competition, 'verificationHash'> {
  participantCount: number;
}

type CleanParticipation = Omit<Participation, 'startSnapshotId' | 'endSnapshotId'>;

export interface ParticipationWithCompetition extends CleanParticipation {
  competition: CompetitionWithCount;
}

export interface ParticipationWithPlayer extends CleanParticipation {
  player: Player;
}

export interface CompetitionWithParticipations extends CompetitionWithCount {
  participations: ParticipationWithPlayer[];
}

export interface Team {
  name: string;
  participants: string[];
}
