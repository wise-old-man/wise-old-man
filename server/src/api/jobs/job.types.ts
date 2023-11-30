import { JobsOptions as BullJobOptions, RateLimiterOptions } from 'bullmq';
import { AssertPlayerTypePayload } from './instances/AssertPlayerTypeJob';
import { CheckPlayerBannedPayload } from './instances/CheckPlayerBannedJob';
import { CheckPlayerRankedPayload } from './instances/CheckPlayerRankedJob';
import { InvalidatePeriodDeltasPayload } from './instances/InvalidatePeriodDeltasJob';
import { ReviewNameChangePayload } from './instances/ReviewNameChangeJob';
import { UpdateCompetitionScorePayload } from './instances/UpdateCompetitionScoreJob';
import { UpdateGroupScorePayload } from './instances/UpdateGroupScoreJob';
import { UpdatePlayerJobPayload } from './instances/UpdatePlayerJob';
import { CalculateRankLimitsPayload } from './instances/CalculateRankLimitsJob';
import { CalculateSumsPayload } from './instances/CalculateSumsJob';

export enum JobType {
  ASSERT_PLAYER_TYPE = 'ASSERT_PLAYER_TYPE',
  AUTO_UPDATE_PATRON_GROUPS = 'AUTO_UPDATE_PATRON_GROUPS',
  AUTO_UPDATE_PATRON_PLAYERS = 'AUTO_UPDATE_PATRON_PLAYERS',
  CALCULATE_SUMS = 'CALCULATE_SUMS',
  CALCULATE_RANK_LIMITS = 'CALCULATE_RANK_LIMITS',
  CHECK_PLAYER_BANNED = 'CHECK_PLAYER_BANNED',
  CHECK_PLAYER_RANKED = 'CHECK_PLAYER_RANKED',
  INVALIDATE_PERIOD_DELTAS = 'INVALIDATE_PERIOD_DELTAS',
  SYNC_API_KEYS = 'SYNC_API_KEYS',
  SYNC_PATRONS = 'SYNC_PATRONS',
  REVIEW_NAME_CHANGE = 'REVIEW_NAME_CHANGE',
  SCHEDULE_COMPETITION_EVENTS = 'SCHEDULE_COMPETITION_EVENTS',
  SCHEDULE_COMPETITION_SCORE_UPDATES = 'SCHEDULE_COMPETITION_SCORE_UPDATES',
  SCHEDULE_DELTA_INVALIDATIONS = 'SCHEDULE_DELTA_INVALIDATIONS',
  SCHEDULE_GROUP_SCORE_UPDATES = 'SCHEDULE_GROUP_SCORE_UPDATES',
  SCHEDULE_NAME_CHANGE_REVIEWS = 'SCHEDULE_NAME_CHANGE_REVIEWS',
  SCHEDULE_BANNED_PLAYER_CHECKS = 'SCHEDULE_BANNED_PLAYER_CHECKS',
  SCHEDULE_FLAGGED_PLAYER_REVIEW = 'SCHEDULE_FLAGGED_PLAYER_REVIEW',
  SCHEDULE_SUM_CALCS = 'SCHEDULE_SUM_CALCS',
  SCHEDULE_RANK_LIMIT_CALCS = 'SCHEDULE_RANK_LIMIT_CALCS',
  UPDATE_COMPETITION_SCORE = 'UPDATE_COMPETITION_SCORE',
  UPDATE_GROUP_SCORE = 'UPDATE_GROUP_SCORE',
  UPDATE_PLAYER = 'UPDATE_PLAYER'
}

export type JobPayload = {
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypePayload;
  [JobType.CHECK_PLAYER_BANNED]: CheckPlayerBannedPayload;
  [JobType.CHECK_PLAYER_RANKED]: CheckPlayerRankedPayload;
  [JobType.INVALIDATE_PERIOD_DELTAS]: InvalidatePeriodDeltasPayload;
  [JobType.REVIEW_NAME_CHANGE]: ReviewNameChangePayload;
  [JobType.UPDATE_COMPETITION_SCORE]: UpdateCompetitionScorePayload;
  [JobType.UPDATE_GROUP_SCORE]: UpdateGroupScorePayload;
  [JobType.UPDATE_PLAYER]: UpdatePlayerJobPayload;
  [JobType.SYNC_PATRONS]: undefined;
  [JobType.CALCULATE_RANK_LIMITS]: CalculateRankLimitsPayload;
  [JobType.CALCULATE_SUMS]: CalculateSumsPayload;
};

export enum JobPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

type JobMapper<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export type DispatchableJob = JobMapper<JobPayload>[keyof JobMapper<JobPayload>];

export type CronJob = {
  type: JobType;
  interval: string;
};

export type JobOptions = {
  rateLimiter?: RateLimiterOptions;
  defaultOptions?: BullJobOptions;
};

export interface JobDefinition<T> {
  type: JobType;
  options?: JobOptions;
  execute: (data: T) => Promise<void>;
  onSuccess?: (data: T) => void;
  onFailure?: (data: T, error: Error) => void;
  onFailedAllAttempts?: (data: T, error: Error) => void;
}
