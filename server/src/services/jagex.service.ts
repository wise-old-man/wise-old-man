import { AsyncResult, complete, errored, fromPromise, isComplete, isErrored } from '@attio/fetchable';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import prometheus from '../services/prometheus.service';
import { PlayerType } from '../types';
import { assertNever } from '../utils/assert-never.util';
import { retry } from '../utils/retry.util';
import { logger } from './logger.service';

const RUNEMETRICS_URL = 'https://apps.runescape.com/runemetrics/profile/profile';

const RUNEMETRICS_ERROR_RESPONSE_SCHEMA = z.object({
  error: z.string()
});

export async function getRuneMetricsBannedStatus(username: string): AsyncResult<
  { isBanned: boolean },
  {
    code: 'FAILED_TO_LOAD_RUNEMETRICS';
    subError: unknown;
  }
> {
  async function retriedFunction() {
    const url = `${RUNEMETRICS_URL}?user=${username}`;

    const stopTrackingTimer = prometheus.trackJagexServiceRequest();

    const axiosResult = await fromPromise(axios({ url }));

    stopTrackingTimer({
      service: 'RuneMetrics',
      status: isErrored(axiosResult) ? 0 : 1
    });

    if (isErrored(axiosResult)) {
      return errored({
        code: 'FAILED_TO_LOAD_RUNEMETRICS',
        subError: axiosResult.error as AxiosError
      } as const);
    }

    const parseResult = RUNEMETRICS_ERROR_RESPONSE_SCHEMA.safeParse(axiosResult.value.data);
    const isBanned = parseResult.success && parseResult.data.error === 'NOT_A_MEMBER';

    return complete({ isBanned });
  }

  const result = await retry(retriedFunction);

  if (isComplete(result)) {
    return result;
  }

  return errored({
    code: 'FAILED_TO_LOAD_RUNEMETRICS',
    subError: result.error.subError
  } as const);
}

export function getBaseHiscoresUrl(type: PlayerType = PlayerType.REGULAR) {
  switch (type) {
    case PlayerType.UNKNOWN:
    case PlayerType.REGULAR:
      return `https://services.runescape.com/m=hiscore_oldschool/index_lite.json`;
    case PlayerType.IRONMAN:
      return `https://services.runescape.com/m=hiscore_oldschool_ironman/index_lite.json`;
    case PlayerType.ULTIMATE:
      return `https://services.runescape.com/m=hiscore_oldschool_ultimate/index_lite.json`;
    case PlayerType.HARDCORE:
      return `https://services.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.json`;
    default:
      assertNever(type);
  }
}

const HiscoresErrorSchema = z.union([
  z.object({ code: z.literal('HISCORES_USERNAME_NOT_FOUND') }),
  z.object({ code: z.literal('HISCORES_SERVICE_UNAVAILABLE') }),
  z.object({ code: z.literal('HISCORES_UNEXPECTED_ERROR'), subError: z.unknown() })
]);

export const HiscoresDataSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      xp: z.number(),
      level: z.number(),
      rank: z.number()
    })
  ),
  activities: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      rank: z.number()
    })
  )
});

export type HiscoresData = z.infer<typeof HiscoresDataSchema>;
export type HiscoresError = z.infer<typeof HiscoresErrorSchema>;

export async function fetchHiscoresJSON(
  username: string,
  type: PlayerType = PlayerType.REGULAR
): AsyncResult<HiscoresData, HiscoresError> {
  async function retriedFunction(): AsyncResult<HiscoresData, HiscoresError> {
    const stopTrackingTimer = prometheus.trackJagexServiceRequest();

    const axiosResult = await fromPromise(axios({ url: `${getBaseHiscoresUrl(type)}?player=${username}` }));

    stopTrackingTimer({
      service: 'OSRS Hiscores (JSON)',
      status: isErrored(axiosResult) ? 0 : 1
    });

    if (isErrored(axiosResult)) {
      const axiosError = axiosResult.error as AxiosError;

      if (axiosError.response?.status === 404) {
        return errored({
          code: 'HISCORES_USERNAME_NOT_FOUND'
        } as const);
      }

      logger.error('Unexpected hiscores error', axiosError);

      return errored({
        code: 'HISCORES_UNEXPECTED_ERROR',
        subError: axiosError
      } as const);
    }

    const parsedHiscores = HiscoresDataSchema.safeParse(axiosResult.value.data);

    if (!parsedHiscores.success) {
      return errored({ code: 'HISCORES_SERVICE_UNAVAILABLE' } as const);
    }

    return complete(parsedHiscores.data);
  }

  const result = await retry(retriedFunction);

  if (isComplete(result)) {
    return result;
  }

  const parsedError = HiscoresErrorSchema.safeParse(result.error);

  if (parsedError.success) {
    return errored(parsedError.data);
  }

  return errored({
    code: 'HISCORES_UNEXPECTED_ERROR',
    subError: result.error
  } as const);
}
