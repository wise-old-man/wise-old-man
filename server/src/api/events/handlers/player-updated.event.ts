import { jobManager, JobPriority, JobType } from '../../../jobs';
import prometheusService from '../../../services/prometheus.service';
import { Period, PERIODS } from '../../../types';
import { PeriodProps } from '../../../utils/shared';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({
  username,
  hasChanged,
  lastChangedAt,
  latestSnapshotDate,
  previousSnapshotDate
}: EventPayloadMap[EventType.PLAYER_UPDATED]) {
  jobManager.add(JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS, { username });

  if (previousSnapshotDate !== null) {
    const timeBetweenUpdates = latestSnapshotDate.getTime() - previousSnapshotDate.getTime();
    const timeSinceLastChange = lastChangedAt ? latestSnapshotDate.getTime() - lastChangedAt.getTime() : 0;

    for (const period of PERIODS) {
      if (timeBetweenUpdates > PeriodProps[period].milliseconds) {
        continue;
      }

      if (!hasChanged && timeSinceLastChange > PeriodProps[period].milliseconds) {
        prometheusService.trackGenericMetric('skipped_delta_sync');
      }

      jobManager.add(
        JobType.SYNC_PLAYER_DELTAS,
        { username, period },
        { priority: period === Period.YEAR ? JobPriority.LOW : JobPriority.MEDIUM }
      );
    }
  }

  if (hasChanged) {
    jobManager.add(JobType.SYNC_PLAYER_ACHIEVEMENTS, {
      username,
      previousSnapshotDate
    });
  }
}
