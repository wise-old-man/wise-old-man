import { JobsOptions as BullJobOptions, RateLimiterOptions } from 'bullmq';
import { AssertPlayerTypePayload } from './instances/AssertPlayerTypeJob';
import { InvalidatePeriodDeltasPayload } from './instances/InvalidatePeriodDeltasJob';
import { ReviewNameChangePayload } from './instances/ReviewNameChangeJob';
import { UpdateCompetitionScorePayload } from './instances/UpdateCompetitionScoreJob';
import { UpdateGroupScorePayload } from './instances/UpdateGroupScoreJob';
import { UpdatePlayerJobPayload } from './instances/UpdatePlayerJob';

export enum JobType {
  ASSERT_PLAYER_TYPE = 'ASSERT_PLAYER_TYPE',
  INVALIDATE_PERIOD_DELTAS = 'INVALIDATE_PERIOD_DELTAS',
  REFRESH_API_KEYS = 'REFRESH_API_KEYS',
  REVIEW_NAME_CHANGE = 'REVIEW_NAME_CHANGE',
  SCHEDULE_COMPETITION_EVENTS = 'SCHEDULE_COMPETITION_EVENTS',
  SCHEDULE_COMPETITION_SCORE_UPDATES = 'SCHEDULE_COMPETITION_SCORE_UPDATES',
  SCHEDULE_DELTA_INVALIDATIONS = 'SCHEDULE_DELTA_INVALIDATIONS',
  SCHEDULE_GROUP_SCORE_UPDATES = 'SCHEDULE_GROUP_SCORE_UPDATES',
  SCHEDULE_NAME_CHANGE_REVIEWS = 'SCHEDULE_NAME_CHANGE_REVIEWS',
  UPDATE_COMPETITION_SCORE = 'UPDATE_COMPETITION_SCORE',
  UPDATE_GROUP_SCORE = 'UPDATE_GROUP_SCORE',
  UPDATE_PLAYER = 'UPDATE_PLAYER'
}

export type JobPayload = {
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypePayload;
  [JobType.INVALIDATE_PERIOD_DELTAS]: InvalidatePeriodDeltasPayload;
  [JobType.REVIEW_NAME_CHANGE]: ReviewNameChangePayload;
  [JobType.UPDATE_COMPETITION_SCORE]: UpdateCompetitionScorePayload;
  [JobType.UPDATE_GROUP_SCORE]: UpdateGroupScorePayload;
  [JobType.UPDATE_PLAYER]: UpdatePlayerJobPayload;
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
}
