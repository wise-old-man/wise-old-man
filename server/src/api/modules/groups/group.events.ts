import { JobType, jobManager } from '../../../jobs';

async function onGroupCreated(groupId: number) {
  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}

async function onGroupUpdated(groupId: number) {
  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}

export { onGroupCreated, onGroupUpdated };
