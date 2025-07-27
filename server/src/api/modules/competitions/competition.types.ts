import { Competition, Participation, Player } from '../../../types';
import { GroupResponse } from '../../responses/group.response';
import { MeasuredDeltaProgress } from '../deltas/delta.types';

// The verification hash shouldn't be exposed to the user
type CleanCompetition = Omit<Competition, 'verificationHash'>;

// These IDs don't need to be exposed to the user
type CleanParticipation = Omit<Participation, 'startSnapshotId' | 'endSnapshotId'>;

export interface CompetitionListItem extends CleanCompetition {
  group?: GroupResponse;
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
  levels: MeasuredDeltaProgress;
}

export interface ParticipationWithCompetitionAndStandings extends ParticipationWithCompetition {
  progress: MeasuredDeltaProgress;
  levels: MeasuredDeltaProgress;
  rank: number;
}

export type Top5ProgressResult = Array<{
  player: Player;
  history: Array<{
    value: number;
    date: Date;
  }>;
}>;
