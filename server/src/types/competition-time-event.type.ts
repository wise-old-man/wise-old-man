import { CompetitionTimeEventStatus } from './competition-time-event-status.enum';
import { CompetitionTimeEventType } from './competition-time-event-type.enum';

export interface CompetitionTimeEvent {
  id: number;
  competitionId: number;
  type: CompetitionTimeEventType;

  offsetMinutes: number;

  executeAt: Date;
  status: CompetitionTimeEventStatus;
  attempts: number;

  executingAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  canceledAt: Date | null;

  createdAt: Date;
}
