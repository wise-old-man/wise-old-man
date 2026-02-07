import { AddPlayersToGroupCompetitionsJobHandler } from './handlers/add-players-to-group-competitions.job';
import { AssertPlayerTypeJobHandler } from './handlers/assert-player-type.job';
import { CalculateComputedRankTablesJobHandler } from './handlers/calculate-computed-rank-tables.job';
import { CalculateSailingExpTrendJobHandler } from './handlers/calculate-sailing-exp-trend.job';
import { CheckCreationSpamJobHandler } from './handlers/check-creation-spam.job';
import { CheckInappropriateContentJobHandler } from './handlers/check-inappropriate-content.job';
import { CheckMissingComputedRankTablesJobHandler } from './handlers/check-missing-computed-rank-tables.job';
import { CheckPlayerBannedJobHandler } from './handlers/check-player-banned.job';
import { CheckPlayerRankedJobHandler } from './handlers/check-player-ranked.job';
import { CheckProtectedPlayersSpamJobHandler } from './handlers/check-protected-players-spam.job';
import { DispatchCompetitionCreatedDiscordEventJobHandler } from './handlers/dispatch-competition-created-discord-event.job';
import { DispatchCompetitionEndedDiscordEventJobHandler } from './handlers/dispatch-competition-ended-discord-event.job';
import { DispatchCompetitionEndingDiscordEventJobHandler } from './handlers/dispatch-competition-ending-discord-event.job';
import { DispatchCompetitionStartedDiscordEventJobHandler } from './handlers/dispatch-competition-started-discord-event.job';
import { DispatchCompetitionStartingDiscordEventJobHandler } from './handlers/dispatch-competition-starting-discord-event.job';
import { DispatchMemberAchievementsDiscordEventJobHandler } from './handlers/dispatch-member-achievements-discord-event.job';
import { DispatchMemberHcimDiedDiscordEventJobHandler } from './handlers/dispatch-member-hcim-died-discord-event.job';
import { DispatchMemberNameChangedDiscordEventJobHandler } from './handlers/dispatch-member-name-changed-discord-event.job';
import { DispatchMembersJoinedDiscordEventJobHandler } from './handlers/dispatch-members-joined-discord-event.job';
import { DispatchMembersLeftDiscordEventJobHandler } from './handlers/dispatch-members-left-discord-event.job';
import { DispatchMembersRolesChangedDiscordEventJobHandler } from './handlers/dispatch-members-roles-changed-discord-event.job';
import { DispatchPlayerFlaggedDiscordEventJobHandler } from './handlers/dispatch-player-flagged-discord-event.job';
import { EnqueueCompetitionTimeEventsJobHandler } from './handlers/enqueue-competition-time-events.job';
import { ExecuteCompetitionTimeEventJobHandler } from './handlers/execute-competition-time-event.job';
import { InvalidateDeltasJobHandler } from './handlers/invalidate-deltas.job';
import { RecalculateCompetitionTimeEventsJobHandler } from './handlers/recalculate-competition-time-events.job';
import { RecalculatePlayerAchievementsJobHandler } from './handlers/recalculate-player-achievements.job';
import { RemovePlayersFromGroupCompetitionsJobHandler } from './handlers/remove-players-from-group-competitions.job';
import { ReviewNameChangeJobHandler } from './handlers/review-name-change.job';
import { ScheduleBannedPlayerChecksJobHandler } from './handlers/schedule-banned-player-checks.job';
import { ScheduleCompetitionEventsJobHandler } from './handlers/schedule-competition-events.job';
import { ScheduleCompetitionScoreUpdatesJobHandler } from './handlers/schedule-competition-score-updates.job';
import { ScheduleFlaggedPlayerReviewJobHandler } from './handlers/schedule-flagged-player-review.job';
import { ScheduleGroupScoreUpdatesJobHandler } from './handlers/schedule-group-score-updates.job';
import { ScheduleNameChangeReviewsJobHandler } from './handlers/schedule-name-change-reviews.job';
import { SchedulePatronGroupUpdatesJobHandler } from './handlers/schedule-patron-group-updates.job';
import { SchedulePatronPlayerUpdatesJobHandler } from './handlers/schedule-patron-player-updates.job';
import { ScheduleTrendDatapointCalculationsJobHandler } from './handlers/schedule-trend-datapoint-calculations.job';
import { SyncApiKeysJobHandler } from './handlers/sync-api-keys.job';
import { SyncPatronsJobHandler } from './handlers/sync-patrons.job';
import { SyncPlayerAchievementsJobHandler } from './handlers/sync-player-achievements.job';
import { SyncPlayerCompetitionParticipationsJobHandler } from './handlers/sync-player-competition-participations.job';
import { SyncPlayerDeltasJobHandler } from './handlers/sync-player-deltas.job';
import { SyncPlayerRecordsJobHandler } from './handlers/sync-player-records.job';
import { UpdateCompetitionParticipantsJobHandler } from './handlers/update-competition-participants.job';
import { UpdateCompetitionScoreJobHandler } from './handlers/update-competition-score.job';
import { UpdateGroupScoreJobHandler } from './handlers/update-group-score.job';
import { UpdateNewCompetitionParticipantsJobHandler } from './handlers/update-new-competition-participants.job';
import { UpdateNewGroupMembersJobHandler } from './handlers/update-new-group-members.job';
import { UpdatePlayerJobHandler } from './handlers/update-player.job';
import { UpdateQueueMetricsJobHandler } from './handlers/update-queue-metrics.job';
import { JobHandler } from './types/job-handler.type';
import { JobType } from './types/job-type.enum';

export const JOB_HANDLER_MAP = {
  [JobType.ADD_PLAYERS_TO_GROUP_COMPETITIONS]: AddPlayersToGroupCompetitionsJobHandler,
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypeJobHandler,
  [JobType.CALCULATE_COMPUTED_RANK_TABLES]: CalculateComputedRankTablesJobHandler,
  [JobType.CALCULATE_SAILING_EXP_TREND]: CalculateSailingExpTrendJobHandler,
  [JobType.CHECK_CREATION_SPAM]: CheckCreationSpamJobHandler,
  [JobType.CHECK_INAPPROPRIATE_CONTENT]: CheckInappropriateContentJobHandler,
  [JobType.CHECK_MISSING_COMPUTED_RANK_TABLES]: CheckMissingComputedRankTablesJobHandler,
  [JobType.CHECK_PLAYER_BANNED]: CheckPlayerBannedJobHandler,
  [JobType.CHECK_PLAYER_RANKED]: CheckPlayerRankedJobHandler,
  [JobType.CHECK_PROTECED_PLAYERS_SPAM]: CheckProtectedPlayersSpamJobHandler,
  [JobType.DISPATCH_COMPETITION_CREATED_DISCORD_EVENT]: DispatchCompetitionCreatedDiscordEventJobHandler,
  [JobType.DISPATCH_COMPETITION_ENDED_DISCORD_EVENT]: DispatchCompetitionEndedDiscordEventJobHandler,
  [JobType.DISPATCH_COMPETITION_ENDING_DISCORD_EVENT]: DispatchCompetitionEndingDiscordEventJobHandler,
  [JobType.DISPATCH_COMPETITION_STARTED_DISCORD_EVENT]: DispatchCompetitionStartedDiscordEventJobHandler,
  [JobType.DISPATCH_COMPETITION_STARTING_DISCORD_EVENT]: DispatchCompetitionStartingDiscordEventJobHandler,
  [JobType.DISPATCH_MEMBER_ACHIEVEMENTS_DISCORD_EVENT]: DispatchMemberAchievementsDiscordEventJobHandler,
  [JobType.DISPATCH_MEMBER_HCIM_DIED_DISCORD_EVENT]: DispatchMemberHcimDiedDiscordEventJobHandler,
  [JobType.DISPATCH_MEMBER_NAME_CHANGED_DISCORD_EVENT]: DispatchMemberNameChangedDiscordEventJobHandler,
  [JobType.DISPATCH_MEMBERS_JOINED_DISCORD_EVENT]: DispatchMembersJoinedDiscordEventJobHandler,
  [JobType.DISPATCH_MEMBERS_LEFT_DISCORD_EVENT]: DispatchMembersLeftDiscordEventJobHandler,
  [JobType.DISPATCH_MEMBERS_ROLES_CHANGED_DISCORD_EVENT]: DispatchMembersRolesChangedDiscordEventJobHandler,
  [JobType.DISPATCH_PLAYER_FLAGGED_DISCORD_EVENT]: DispatchPlayerFlaggedDiscordEventJobHandler,
  [JobType.ENQUEUE_COMPETITION_TIME_EVENTS]: EnqueueCompetitionTimeEventsJobHandler,
  [JobType.EXECUTE_COMPETITION_TIME_EVENT]: ExecuteCompetitionTimeEventJobHandler,
  [JobType.INVALIDATE_DELTAS]: InvalidateDeltasJobHandler,
  [JobType.RECALCULATE_COMPETITION_TIME_EVENTS]: RecalculateCompetitionTimeEventsJobHandler,
  [JobType.RECALCULATE_PLAYER_ACHIEVEMENTS]: RecalculatePlayerAchievementsJobHandler,
  [JobType.REMOVE_PLAYERS_FROM_GROUP_COMPETITIONS]: RemovePlayersFromGroupCompetitionsJobHandler,
  [JobType.REVIEW_NAME_CHANGE]: ReviewNameChangeJobHandler,
  [JobType.SCHEDULE_BANNED_PLAYER_CHECKS]: ScheduleBannedPlayerChecksJobHandler,
  [JobType.SCHEDULE_COMPETITION_EVENTS]: ScheduleCompetitionEventsJobHandler,
  [JobType.SCHEDULE_COMPETITION_SCORE_UPDATES]: ScheduleCompetitionScoreUpdatesJobHandler,
  [JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW]: ScheduleFlaggedPlayerReviewJobHandler,
  [JobType.SCHEDULE_GROUP_SCORE_UPDATES]: ScheduleGroupScoreUpdatesJobHandler,
  [JobType.SCHEDULE_NAME_CHANGE_REVIEWS]: ScheduleNameChangeReviewsJobHandler,
  [JobType.SCHEDULE_PATRON_GROUP_UPDATES]: SchedulePatronGroupUpdatesJobHandler,
  [JobType.SCHEDULE_PATRON_PLAYER_UPDATES]: SchedulePatronPlayerUpdatesJobHandler,
  [JobType.SCHEDULE_TREND_DATAPOINT_CALCULATIONS]: ScheduleTrendDatapointCalculationsJobHandler,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJobHandler,
  [JobType.SYNC_PATRONS]: SyncPatronsJobHandler,
  [JobType.SYNC_PLAYER_ACHIEVEMENTS]: SyncPlayerAchievementsJobHandler,
  [JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS]: SyncPlayerCompetitionParticipationsJobHandler,
  [JobType.SYNC_PLAYER_DELTAS]: SyncPlayerDeltasJobHandler,
  [JobType.SYNC_PLAYER_RECORDS]: SyncPlayerRecordsJobHandler,
  [JobType.UPDATE_COMPETITION_PARTICIPANTS]: UpdateCompetitionParticipantsJobHandler,
  [JobType.UPDATE_COMPETITION_SCORE]: UpdateCompetitionScoreJobHandler,
  [JobType.UPDATE_GROUP_SCORE]: UpdateGroupScoreJobHandler,
  [JobType.UPDATE_NEW_COMPETITION_PARTICIPANTS]: UpdateNewCompetitionParticipantsJobHandler,
  [JobType.UPDATE_NEW_GROUP_MEMBERS]: UpdateNewGroupMembersJobHandler,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJobHandler,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJobHandler
} satisfies Record<JobType, JobHandler<unknown>>;

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.CHECK_CREATION_SPAM },
  { interval: '* * * * *', type: JobType.CHECK_PROTECED_PLAYERS_SPAM },
  { interval: '* * * * *', type: JobType.ENQUEUE_COMPETITION_TIME_EVENTS },
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
  JobType.UPDATE_QUEUE_METRICS,
  JobType.ENQUEUE_COMPETITION_TIME_EVENTS
] as const;
