import { JobType, jobManager } from '../../../jobs';

async function onGroupUpdated(groupId: number) {
  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}

export { onGroupUpdated };
