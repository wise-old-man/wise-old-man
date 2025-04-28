import { AssertPlayerTypeJob } from './handlers/assert-player-type.job';
import { CheckPlayerBannedJob } from './handlers/check-player-banned.job';
import { CheckPlayerRankedJob } from './handlers/check-player-ranked.job';
import { InvalidateDeltasJob } from './handlers/invalidate-deltas.job';
import { ReviewNameChangeJob } from './handlers/review-name-change.job';
import { ScheduleBannedPlayerChecksJob } from './handlers/schedule-banned-player-checks.job';
import { ScheduleCompetitionScoreUpdatesJob } from './handlers/schedule-competition-score-updates.job';
import { ScheduleFlaggedPlayerReviewJob } from './handlers/schedule-flagged-player-review.job';
import { ScheduleGroupScoreUpdatesJob } from './handlers/schedule-group-score-updates.job';
import { ScheduleNameChangeReviewsJob } from './handlers/schedule-name-change-reviews.job';
import { SchedulePatronGroupUpdatesJob } from './handlers/schedule-patron-group-updates.job';
import { SchedulePatronPlayerUpdatesJob } from './handlers/schedule-patron-player-updates.job';
import { SyncApiKeysJob } from './handlers/sync-api-keys.job';
import { SyncPatronsJob } from './handlers/sync-patrons.job';
import { SyncPlayerAchievementsJob } from './handlers/sync-player-achievements.job';
import { SyncPlayerCompetitionParticipationsJob } from './handlers/sync-player-competition-participations.job';
import { SyncPlayerDeltasJob } from './handlers/sync-player-deltas.job';
import { SyncPlayerRecordsJob } from './handlers/sync-player-records.job';
import { UpdateCompetitionScoreJob } from './handlers/update-competition-score.job';
import { UpdateGroupScoreJob } from './handlers/update-group-score.job';
import { UpdatePlayerJob } from './handlers/update-player.job';
import { UpdateQueueMetricsJob } from './handlers/update-queue-metrics.job';
import { JobType } from './types/job-type.enum';

export const JOB_HANDLER_MAP = {
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypeJob,
  [JobType.CHECK_PLAYER_BANNED]: CheckPlayerBannedJob,
  [JobType.CHECK_PLAYER_RANKED]: CheckPlayerRankedJob,
  [JobType.INVALIDATE_DELTAS]: InvalidateDeltasJob,
  [JobType.REVIEW_NAME_CHANGE]: ReviewNameChangeJob,
  [JobType.SCHEDULE_BANNED_PLAYER_CHECKS]: ScheduleBannedPlayerChecksJob,
  [JobType.SCHEDULE_COMPETITION_SCORE_UPDATES]: ScheduleCompetitionScoreUpdatesJob,
  [JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW]: ScheduleFlaggedPlayerReviewJob,
  [JobType.SCHEDULE_GROUP_SCORE_UPDATES]: ScheduleGroupScoreUpdatesJob,
  [JobType.SCHEDULE_NAME_CHANGE_REVIEWS]: ScheduleNameChangeReviewsJob,
  [JobType.SCHEDULE_PATRON_GROUP_UPDATES]: SchedulePatronGroupUpdatesJob,
  [JobType.SCHEDULE_PATRON_PLAYER_UPDATES]: SchedulePatronPlayerUpdatesJob,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJob,
  [JobType.SYNC_PATRONS]: SyncPatronsJob,
  [JobType.SYNC_PLAYER_ACHIEVEMENTS]: SyncPlayerAchievementsJob,
  [JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS]: SyncPlayerCompetitionParticipationsJob,
  [JobType.SYNC_PLAYER_DELTAS]: SyncPlayerDeltasJob,
  [JobType.SYNC_PLAYER_RECORDS]: SyncPlayerRecordsJob,
  [JobType.UPDATE_COMPETITION_SCORE]: UpdateCompetitionScoreJob,
  [JobType.UPDATE_GROUP_SCORE]: UpdateGroupScoreJob,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJob,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJob
};

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.SYNC_API_KEYS },
  { interval: '* * * * *', type: JobType.SYNC_PATRONS },
  { interval: '* * * * *', type: JobType.UPDATE_QUEUE_METRICS },
  // every 5 mins
  { interval: '*/5 * * * *', type: JobType.SCHEDULE_PATRON_GROUP_UPDATES },
  { interval: '*/5 * * * *', type: JobType.SCHEDULE_PATRON_PLAYER_UPDATES },
  // every hour
  { interval: '0 * * * *', type: JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW },
  // Every 6 hours
  { interval: '0 */6 * * *', type: JobType.INVALIDATE_DELTAS },
  // everyday at 8 AM UTC
  { interval: '0 8 * * *', type: JobType.SCHEDULE_BANNED_PLAYER_CHECKS },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_COMPETITION_SCORE_UPDATES },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_GROUP_SCORE_UPDATES },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_NAME_CHANGE_REVIEWS }
];

// Jobs to run when the server starts
export const STARTUP_JOBS = [JobType.SYNC_API_KEYS, JobType.UPDATE_QUEUE_METRICS] as const;
