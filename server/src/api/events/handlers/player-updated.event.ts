import { jobManager, JobPriority, JobType } from '../../../jobs';
import { Period, PERIODS } from '../../../types';
import { PeriodProps } from '../../../utils/shared';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({
  username,
  hasChanged,
  previousUpdatedAt
}: EventPayloadMap[EventType.PLAYER_UPDATED]) {
  jobManager.add(JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS, { username });

  if (previousUpdatedAt !== null) {
    const timeSinceLastUpdate = Date.now() - previousUpdatedAt.getTime();

    for (const period of PERIODS) {
      if (timeSinceLastUpdate > PeriodProps[period].milliseconds) {
        continue;
      }

      jobManager.add(
        JobType.SYNC_PLAYER_DELTAS,
        { username, period },
        { priority: period === Period.YEAR ? JobPriority.LOW : JobPriority.MEDIUM }
      );
    }
  }

  if (hasChanged) {
    jobManager.add(JobType.SYNC_PLAYER_ACHIEVEMENTS, { username, previousUpdatedAt });
  }
}
