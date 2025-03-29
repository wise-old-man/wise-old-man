import jobManager from '../../../jobs/job.manager';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

function handler({ nameChangeId }: EventPayloadMap[EventType.NAME_CHANGE_CREATED]) {
  jobManager.add('ReviewNameChangeJob', { nameChangeId });
}

export default { handler };
