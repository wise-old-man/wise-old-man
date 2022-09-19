import { JobsOptions as BullJobOptions, RateLimiterOptions } from 'bullmq';
import { AssertPlayerTypePayload } from './instances/AssertPlayerTypeJob';
import { ReviewNameChangePayload } from './instances/ReviewNameChangeJob';
import { ReviewPlayerTypePayload } from './instances/ReviewPlayerTypeJob';
import { UpdatePlayerJobPayload } from './instances/UpdatePlayerJob';

export enum JobType {
  UPDATE_PLAYER = 'UPDATE_PLAYER',
  ASSERT_PLAYER_TYPE = 'ASSERT_PLAYER_TYPE',
  INVALIDATE_DELTAS = 'INVALIDATE_DELTAS',
  REFRESH_COMPETITION_RANKINGS = 'REFRESH_COMPETITION_RANKINGS',
  REFRESH_GROUP_RANKINGS = 'REFRESH_GROUP_RANKINGS',
  REFRESH_NAME_CHANGES = 'REFRESH_NAME_CHANGES',
  REVIEW_NAME_CHANGE = 'REVIEW_NAME_CHANGE',
  REVIEW_PLAYER_TYPE = 'REVIEW_PLAYER_TYPE',
  SCHEDULE_COMPETITION_EVENTS = 'SCHEDULE_COMPETITION_EVENTS'
}

export type JobPayload = {
  [JobType.UPDATE_PLAYER]: UpdatePlayerJobPayload;
  [JobType.ASSERT_PLAYER_TYPE]: AssertPlayerTypePayload;
  [JobType.REVIEW_NAME_CHANGE]: ReviewNameChangePayload;
  [JobType.REVIEW_PLAYER_TYPE]: ReviewPlayerTypePayload;
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
