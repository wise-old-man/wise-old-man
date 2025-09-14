import { jobManager, JobType } from '../../../jobs';
import prometheus from '../../../services/prometheus.service';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ username, achievements }: EventPayloadMap[EventType.PLAYER_ACHIEVEMENTS_CREATED]) {
  jobManager.add(JobType.DISPATCH_MEMBER_ACHIEVEMENTS_DISCORD_EVENT, { username, achievements });

  if (username === 'psikoi ii') {
    prometheus.trackGenericMetric('test-emitter-handler');
  }
}
