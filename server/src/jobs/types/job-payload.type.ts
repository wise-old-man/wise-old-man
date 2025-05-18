import { JOB_HANDLER_MAP } from '../jobs.config';

type ExtractInstanceType<T> = T extends new (...args: unknown[]) => infer R
  ? R
  : T extends { prototype: infer P }
    ? P
    : unknown;

type ValueOf<T> = T[keyof T];

type JobPayloadType<T extends ValueOf<typeof JOB_HANDLER_MAP>> = Parameters<
  ExtractInstanceType<T>['execute']
>[0];

export type JobPayloadMapper = {
  [K in keyof typeof JOB_HANDLER_MAP]: JobPayloadType<(typeof JOB_HANDLER_MAP)[K]>;
};
