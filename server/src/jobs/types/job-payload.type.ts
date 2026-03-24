import { JOB_HANDLER_MAP } from '../jobs.config';

type ValueOf<T> = T[keyof T];

type JobHandlerPayloadType<T extends ValueOf<typeof JOB_HANDLER_MAP>> = Parameters<T['execute']>[0];

export type JobHandlerPayloadMapper = {
  [K in keyof typeof JOB_HANDLER_MAP]: JobHandlerPayloadType<(typeof JOB_HANDLER_MAP)[K]>;
};
