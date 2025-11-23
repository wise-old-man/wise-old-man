import { AddPlayersToGroupCompetitionsJob } from './handlers/add-players-to-group-competitions.job';
import { AssertPlayerTypeJob } from './handlers/assert-player-type.job';
import { BackfillDeleteDuplicateSnapshotsFanoutJob } from './handlers/backfill-delete-duplicate-snapshots-fanout.job';
import { BackfillDeleteDuplicateSnapshotsJob } from './handlers/backfill-delete-duplicate-snapshots.job';
import { BackfillParticipationSnapshotDatesJob } from './handlers/backfill-participation-snapshot-dates.job';
import { BackfillPlayerSnapshotDatesJob } from './handlers/backfill-player-snapshot-dates.job';
import { CalculateComputedRankTablesJob } from './handlers/calculate-computed-rank-tables.job';
import { CalculateSailingExpTrendJob } from './handlers/calculate-sailing-exp-trend.job';
import { CheckCreationSpamJob } from './handlers/check-creation-spam.job';
import { CheckInappropriateContentJob } from './handlers/check-inappropriate-content.job';
import { CheckMissingComputedRankTablesJob } from './handlers/check-missing-computed-rank-tables.job';
import { CheckPlayerBannedJob } from './handlers/check-player-banned.job';
import { CheckPlayerRankedJob } from './handlers/check-player-ranked.job';
import { CheckProtectedPlayersSpamJob } from './handlers/check-protected-players-spam.job';
import { DispatchCompetitionCreatedDiscordEventJob } from './handlers/dispatch-competition-created-discord-event.job';
import { DispatchCompetitionEndedDiscordEventJob } from './handlers/dispatch-competition-ended-discord-event.job';
import { DispatchCompetitionEndingDiscordEventJob } from './handlers/dispatch-competition-ending-discord-event.job';
import { DispatchCompetitionStartedDiscordEventJob } from './handlers/dispatch-competition-started-discord-event.job';
import { DispatchCompetitionStartingDiscordEventJob } from './handlers/dispatch-competition-starting-discord-event.job';
import { DispatchMemberAchievementsDiscordEventJob } from './handlers/dispatch-member-achievements-discord-event.job';
import { DispatchMemberHcimDiedDiscordEventJob } from './handlers/dispatch-member-hcim-died-discord-event.job';
import { DispatchMemberNameChangedDiscordEventJob } from './handlers/dispatch-member-name-changed-discord-event.job';
import { DispatchMembersJoinedDiscordEventJob } from './handlers/dispatch-members-joined-discord-event.job';
import { DispatchMembersLeftDiscordEventJob } from './handlers/dispatch-members-left-discord-event.job';
import { DispatchMembersRolesChangedDiscordEventJob } from './handlers/dispatch-members-roles-changed-discord-event.job';
import { DispatchPlayerFlaggedDiscordEventJob } from './handlers/dispatch-player-flagged-discord-event.job';
import { InvalidateDeltasJob } from './handlers/invalidate-deltas.job';
import { RecalculatePlayerAchievementsJob } from './handlers/recalculate-player-achievements.job';
import { RemovePlayersFromGroupCompetitionsJob } from './handlers/remove-players-from-group-competitions.job';
import { ReviewNameChangeJob } from './handlers/review-name-change.job';
import { ScheduleBannedPlayerChecksJob } from './handlers/schedule-banned-player-checks.job';
import { ScheduleCompetitionEventsJob } from './handlers/schedule-competition-events.job';
import { ScheduleCompetitionScoreUpdatesJob } from './handlers/schedule-competition-score-updates.job';
import { ScheduleFlaggedPlayerReviewJob } from './handlers/schedule-flagged-player-review.job';
import { ScheduleGroupScoreUpdatesJob } from './handlers/schedule-group-score-updates.job';
import { ScheduleNameChangeReviewsJob } from './handlers/schedule-name-change-reviews.job';
import { SchedulePatronGroupUpdatesJob } from './handlers/schedule-patron-group-updates.job';
import { SchedulePatronPlayerUpdatesJob } from './handlers/schedule-patron-player-updates.job';
import { ScheduleTrendDatapointCalculationsJob } from './handlers/schedule-trend-datapoint-calculations.job';
import { SyncApiKeysJob } from './handlers/sync-api-keys.job';
import { SyncPatronsJob } from './handlers/sync-patrons.job';
import { SyncPlayerAchievementsJob } from './handlers/sync-player-achievements.job';
import { SyncPlayerCompetitionParticipationsJob } from './handlers/sync-player-competition-participations.job';
import { SyncPlayerDeltasJob } from './handlers/sync-player-deltas.job';
import { SyncPlayerRecordsJob } from './handlers/sync-player-records.job';
import { UpdateCompetitionParticipantsJob } from './handlers/update-competition-participants.job';
import { UpdateCompetitionScoreJob } from './handlers/update-competition-score.job';
import { UpdateGroupScoreJob } from './handlers/update-group-score.job';
import { UpdateNewCompetitionParticipantsJob } from './handlers/update-new-competition-participants.job';
import { UpdateNewGroupMembersJob } from './handlers/update-new-group-members.job';
import { UpdatePlayerJob } from './handlers/update-player.job';
import { UpdateQueueMetricsJob } from './handlers/update-queue-metrics.job';
import { Job } from './job.class';
import { JobType } from './types/job-type.enum';

export const JOB_HANDLER_MAP = {
  [JobType.ADD_PLAYERS_TO_GROUP_COMPETITIONS]: AddPlayersToGroupCompetitionsJob,
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypeJob,
  [JobType.BACKFILL_DELETE_DUPLICATE_SNAPSHOTS]: BackfillDeleteDuplicateSnapshotsJob,
  [JobType.BACKFILL_DELETE_DUPLICATE_SNAPSHOTS_FANOUT]: BackfillDeleteDuplicateSnapshotsFanoutJob,
  [JobType.BACKFILL_PARTICIPATION_SNAPSHOT_DATES]: BackfillParticipationSnapshotDatesJob,
  [JobType.BACKFILL_PLAYER_SNAPSHOT_DATES]: BackfillPlayerSnapshotDatesJob,
  [JobType.CALCULATE_COMPUTED_RANK_TABLES]: CalculateComputedRankTablesJob,
  [JobType.CALCULATE_SAILING_EXP_TREND]: CalculateSailingExpTrendJob,
  [JobType.CHECK_CREATION_SPAM]: CheckCreationSpamJob,
  [JobType.CHECK_INAPPROPRIATE_CONTENT]: CheckInappropriateContentJob,
  [JobType.CHECK_MISSING_COMPUTED_RANK_TABLES]: CheckMissingComputedRankTablesJob,
  [JobType.CHECK_PLAYER_BANNED]: CheckPlayerBannedJob,
  [JobType.CHECK_PLAYER_RANKED]: CheckPlayerRankedJob,
  [JobType.CHECK_PROTECED_PLAYERS_SPAM]: CheckProtectedPlayersSpamJob,
  [JobType.DISPATCH_COMPETITION_CREATED_DISCORD_EVENT]: DispatchCompetitionCreatedDiscordEventJob,
  [JobType.DISPATCH_COMPETITION_ENDED_DISCORD_EVENT]: DispatchCompetitionEndedDiscordEventJob,
  [JobType.DISPATCH_COMPETITION_ENDING_DISCORD_EVENT]: DispatchCompetitionEndingDiscordEventJob,
  [JobType.DISPATCH_COMPETITION_STARTED_DISCORD_EVENT]: DispatchCompetitionStartedDiscordEventJob,
  [JobType.DISPATCH_COMPETITION_STARTING_DISCORD_EVENT]: DispatchCompetitionStartingDiscordEventJob,
  [JobType.DISPATCH_MEMBER_ACHIEVEMENTS_DISCORD_EVENT]: DispatchMemberAchievementsDiscordEventJob,
  [JobType.DISPATCH_MEMBER_HCIM_DIED_DISCORD_EVENT]: DispatchMemberHcimDiedDiscordEventJob,
  [JobType.DISPATCH_MEMBER_NAME_CHANGED_DISCORD_EVENT]: DispatchMemberNameChangedDiscordEventJob,
  [JobType.DISPATCH_MEMBERS_JOINED_DISCORD_EVENT]: DispatchMembersJoinedDiscordEventJob,
  [JobType.DISPATCH_MEMBERS_LEFT_DISCORD_EVENT]: DispatchMembersLeftDiscordEventJob,
  [JobType.DISPATCH_MEMBERS_ROLES_CHANGED_DISCORD_EVENT]: DispatchMembersRolesChangedDiscordEventJob,
  [JobType.DISPATCH_PLAYER_FLAGGED_DISCORD_EVENT]: DispatchPlayerFlaggedDiscordEventJob,
  [JobType.INVALIDATE_DELTAS]: InvalidateDeltasJob,
  [JobType.RECALCULATE_PLAYER_ACHIEVEMENTS]: RecalculatePlayerAchievementsJob,
  [JobType.REMOVE_PLAYERS_FROM_GROUP_COMPETITIONS]: RemovePlayersFromGroupCompetitionsJob,
  [JobType.REVIEW_NAME_CHANGE]: ReviewNameChangeJob,
  [JobType.SCHEDULE_BANNED_PLAYER_CHECKS]: ScheduleBannedPlayerChecksJob,
  [JobType.SCHEDULE_COMPETITION_EVENTS]: ScheduleCompetitionEventsJob,
  [JobType.SCHEDULE_COMPETITION_SCORE_UPDATES]: ScheduleCompetitionScoreUpdatesJob,
  [JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW]: ScheduleFlaggedPlayerReviewJob,
  [JobType.SCHEDULE_GROUP_SCORE_UPDATES]: ScheduleGroupScoreUpdatesJob,
  [JobType.SCHEDULE_NAME_CHANGE_REVIEWS]: ScheduleNameChangeReviewsJob,
  [JobType.SCHEDULE_PATRON_GROUP_UPDATES]: SchedulePatronGroupUpdatesJob,
  [JobType.SCHEDULE_PATRON_PLAYER_UPDATES]: SchedulePatronPlayerUpdatesJob,
  [JobType.SCHEDULE_TREND_DATAPOINT_CALCULATIONS]: ScheduleTrendDatapointCalculationsJob,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJob,
  [JobType.SYNC_PATRONS]: SyncPatronsJob,
  [JobType.SYNC_PLAYER_ACHIEVEMENTS]: SyncPlayerAchievementsJob,
  [JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS]: SyncPlayerCompetitionParticipationsJob,
  [JobType.SYNC_PLAYER_DELTAS]: SyncPlayerDeltasJob,
  [JobType.SYNC_PLAYER_RECORDS]: SyncPlayerRecordsJob,
  [JobType.UPDATE_COMPETITION_PARTICIPANTS]: UpdateCompetitionParticipantsJob,
  [JobType.UPDATE_COMPETITION_SCORE]: UpdateCompetitionScoreJob,
  [JobType.UPDATE_GROUP_SCORE]: UpdateGroupScoreJob,
  [JobType.UPDATE_NEW_COMPETITION_PARTICIPANTS]: UpdateNewCompetitionParticipantsJob,
  [JobType.UPDATE_NEW_GROUP_MEMBERS]: UpdateNewGroupMembersJob,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJob,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJob
} satisfies Record<JobType, typeof Job<unknown>>;

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.CHECK_CREATION_SPAM },
  { interval: '* * * * *', type: JobType.CHECK_PROTECED_PLAYERS_SPAM },
  { interval: '* * * * *', type: JobType.SCHEDULE_COMPETITION_EVENTS },
  { interval: '* * * * *', type: JobType.SYNC_API_KEYS },
  { interval: '* * * * *', type: JobType.SYNC_PATRONS },
  { interval: '* * * * *', type: JobType.UPDATE_QUEUE_METRICS },
  // every 5 mins
  { interval: '*/5 * * * *', type: JobType.CHECK_INAPPROPRIATE_CONTENT },
  { interval: '*/5 * * * *', type: JobType.SCHEDULE_PATRON_GROUP_UPDATES },
  { interval: '*/5 * * * *', type: JobType.SCHEDULE_PATRON_PLAYER_UPDATES },
  // every hour
  { interval: '0 * * * *', type: JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW },
  { interval: '0 * * * *', type: JobType.SCHEDULE_TREND_DATAPOINT_CALCULATIONS },
  // every 6 hours
  { interval: '0 */6 * * *', type: JobType.INVALIDATE_DELTAS },
  // everyday at 8:00 UTC
  { interval: '0 8 * * *', type: JobType.CALCULATE_COMPUTED_RANK_TABLES },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_BANNED_PLAYER_CHECKS },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_COMPETITION_SCORE_UPDATES },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_GROUP_SCORE_UPDATES },
  { interval: '0 8 * * *', type: JobType.SCHEDULE_NAME_CHANGE_REVIEWS }
];

// Jobs to run when the server starts
export const STARTUP_JOBS = [
  JobType.CHECK_MISSING_COMPUTED_RANK_TABLES,
  JobType.SYNC_API_KEYS,
  JobType.UPDATE_QUEUE_METRICS
] as const;
