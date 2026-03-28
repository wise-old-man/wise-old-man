import prisma, { PrismaTypes } from '../../../../prisma';
import { Metric, Period, PlayerAnnotationType, Snapshot } from '../../../../types';
import { getMetricRankKey } from '../../../../utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { parsePeriodExpression } from '../../../../utils/shared/parse-period-expression.util';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

type Datapoint = { value: number; rank: number; date: Date };

async function findPlayerSnapshotTimeline(
  username: string,
  metric: Metric,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date
): Promise<Array<Datapoint>> {
  if (minDate && maxDate && minDate >= maxDate) {
    throw new BadRequestError('Min date must be before the max date.');
  }

  const player = await prisma.player.findFirst({
    where: {
      username: standardizeUsername(username)
    },
    include: { annotations: true }
  });

  // TODO: Refactor error handling
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  const dateQuery: PrismaTypes.SnapshotWhereInput = {};

  if (minDate && maxDate) {
    dateQuery.createdAt = {
      gte: minDate,
      lte: maxDate
    };
  } else if (period) {
    const parsedPeriod = parsePeriodExpression(period);

    if (!parsedPeriod) {
      throw new BadRequestError(`Invalid period: ${period}.`);
    }

    dateQuery.createdAt = {
      gte: new Date(Date.now() - parsedPeriod.durationMs),
      lte: new Date()
    };
  }

  const metricRankKey = getMetricRankKey(metric);
  const metricValueKey = getMetricValueKey(metric);

  const snapshots = (await prisma.snapshot.findMany({
    select: {
      [metricValueKey]: true,
      [metricRankKey]: true,
      createdAt: true
    },
    where: { playerId: player.id, ...dateQuery },
    orderBy: { createdAt: 'desc' }
  })) as unknown as Snapshot[];

  const history = snapshots.map(snapshot => {
    return {
      value: snapshot[metricValueKey],
      rank: snapshot[metricRankKey],
      date: snapshot.createdAt
    };
  });

  return history;
}

export { findPlayerSnapshotTimeline };
