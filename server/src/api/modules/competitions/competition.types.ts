import { Competition, Participation, Player } from '../../../prisma';
import { MeasuredDeltaProgress } from '../deltas/delta.types';
import { GroupListItem } from '../groups/group.types';

// The verification hash shouldn't be exposed to the user
type CleanCompetition = Omit<Competition, 'verificationHash'>;

// These IDs don't need to be exposed to the user
type CleanParticipation = Omit<Participation, 'startSnapshotId' | 'endSnapshotId'>;

export interface CompetitionListItem extends CleanCompetition {
  group?: GroupListItem;
  participantCount: number;
}

export interface CompetitionDetails extends CompetitionListItem {
  participations: ParticipationWithPlayerAndProgress[];
}

export interface CompetitionWithParticipations extends CompetitionListItem {
  participations: ParticipationWithPlayer[];
}

export interface ParticipationWithCompetition extends CleanParticipation {
  competition: CompetitionListItem;
}

export interface ParticipationWithPlayer extends CleanParticipation {
  player: Player;
}

export interface ParticipationWithPlayerAndProgress extends ParticipationWithPlayer {
  progress: MeasuredDeltaProgress;
}

export interface ParticipationWithCompetitionAndStandings extends ParticipationWithCompetition {
  progress: MeasuredDeltaProgress;
  rank: number;
}

export interface Team {
  name: string;
  participants: string[];
}

export type Top5ProgressResult = Array<{
  player: Player;
  history: Array<{
    value: number;
    date: Date;
  }>;
}>;
