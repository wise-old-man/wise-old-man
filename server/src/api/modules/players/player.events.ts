import { jobManager, JobType } from '../../../jobs-new';

async function onPlayerImported(username: string) {
  jobManager.add(JobType.RECALCULATE_PLAYER_ACHIEVEMENTS, { username });
}

export { onPlayerImported };
