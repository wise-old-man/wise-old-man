import { AssertPlayerTypeJob } from './handlers/assert-player-type.job';
import { AutoUpdatePatronGroupsJob } from './handlers/auto-update-patron-groups.job';
import { AutoUpdatePatronPlayersJob } from './handlers/auto-update-patron-players.job';
import { ScheduleGroupScoreUpdatesJob } from './handlers/schedule-group-score-updates.job';
import { SyncApiKeysJob } from './handlers/sync-api-keys.job';
import { SyncPlayerAchievementsJob } from './handlers/sync-player-achievements.job';
import { SyncPlayerCompetitionParticipationsJob } from './handlers/sync-player-competition-participations.job';
import { SyncPlayerDeltasJob } from './handlers/sync-player-deltas.job';
import { UpdateCompetitionScoreJob } from './handlers/update-competition-score.job';
import { UpdateGroupScoreJob } from './handlers/update-group-score.job';
import { UpdatePlayerJob } from './handlers/update-player.job';
import { UpdateQueueMetricsJob } from './handlers/update-queue-metrics.job';
import { JobType } from './types/job-type.enum';

export const JOB_HANDLER_MAP = {
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypeJob,
  [JobType.AUTO_UPDATE_PATRON_GROUPS]: AutoUpdatePatronGroupsJob,
  [JobType.AUTO_UPDATE_PATRON_PLAYERS]: AutoUpdatePatronPlayersJob,
  [JobType.SCHEDULE_COMPETITION_SCORE_UPDATES]: ScheduleGroupScoreUpdatesJob,
  [JobType.SCHEDULE_GROUP_SCORE_UPDATES]: ScheduleGroupScoreUpdatesJob,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJob,
  [JobType.SYNC_PLAYER_ACHIEVEMENTS]: SyncPlayerAchievementsJob,
  [JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS]: SyncPlayerCompetitionParticipationsJob,
  [JobType.SYNC_PLAYER_DELTAS]: SyncPlayerDeltasJob,
  [JobType.UPDATE_COMPETITION_SCORE]: UpdateCompetitionScoreJob,
  [JobType.UPDATE_GROUP_SCORE]: UpdateGroupScoreJob,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJob,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJob
};

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.SYNC_API_KEYS },
  { interval: '* * * * *', type: JobType.UPDATE_QUEUE_METRICS },
  // every 5 mins
  { interval: '*/5 * * * *', type: JobType.AUTO_UPDATE_PATRON_GROUPS },
  { interval: '*/5 * * * *', type: JobType.AUTO_UPDATE_PATRON_PLAYERS },
  // everyday at 8 AM UTC
  { interval: '0 8 * * *', type: JobType.SCHEDULE_COMPETITION_SCORE_UPDATES },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_GROUP_SCORE_UPDATES }
];

// Jobs to run when the server starts
export const STARTUP_JOBS = [JobType.SYNC_API_KEYS, JobType.UPDATE_QUEUE_METRICS] as const;
