import { z } from 'zod';
import prisma, { modifyPlayer, Snapshot } from '../../../../prisma';
import {
  getMetricMeasure,
  getMetricRankKey,
  getMetricValueKey,
  Metric,
  MetricMeasure,
  getTotalLevel,
  getLevel
} from '../../../../utils';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { NotFoundError } from '../../../errors';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { GroupHiscoresEntry } from '../group.types';

const inputSchema = z
  .object({
    id: z.number().positive(),
    metric: z.nativeEnum(Metric)
  })
  .merge(PAGINATION_SCHEMA);

type FetchGroupHiscoresParams = z.infer<typeof inputSchema>;

async function fetchGroupHiscores(payload: FetchGroupHiscoresParams): Promise<GroupHiscoresEntry[]> {
  const params = inputSchema.parse(payload);

  const memberships = await prisma.membership.findMany({
    where: { groupId: params.id },
    include: { player: true }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: params.id }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    return [];
  }

  const measure = getMetricMeasure(params.metric);
  const valueKey = getMetricValueKey(params.metric);

  const latestSnapshots = await snapshotServices.findGroupSnapshots(
    {
      playerIds: memberships.map(m => m.playerId),
      maxDate: new Date()
    },
    { sortBy: valueKey as any, limit: params.limit, offset: params.offset }
  );

  const valueMap = mapSnapshots(latestSnapshots, params.metric, measure);

  return memberships
    .filter(({ playerId }) => valueMap[playerId] && valueMap[playerId].rank > 0)
    .map(m => ({
      membership: { ...m, player: modifyPlayer(m.player) },
      data: valueMap[m.playerId]
    }))
    .sort((a, b) => b.data[measure] - a.data[measure]);
}

type SnapshotMap = { [id: number]: GroupHiscoresEntry['data'] };

// Formats the snapshots to a key:value map (playerId:data).
// Example: { '1623': { rank: 350567, experience: 6412215 } }
function mapSnapshots(snapshots: Snapshot[], metric: Metric, measure: MetricMeasure): SnapshotMap {
  const rankKey = getMetricRankKey(metric);
  const valueKey = getMetricValueKey(metric);

  return Object.fromEntries(
    snapshots.map(s => {
      if (measure === MetricMeasure.EXPERIENCE) {
        const level = metric === Metric.OVERALL ? getTotalLevel(s) : getLevel(s[valueKey]);
        return [s.playerId, { rank: s[rankKey], experience: s[valueKey], level }];
      }

      if (measure === MetricMeasure.KILLS) {
        return [s.playerId, { rank: s[rankKey], kills: s[valueKey] }];
      }

      if (measure === MetricMeasure.SCORE) {
        return [s.playerId, { rank: s[rankKey], score: s[valueKey] }];
      }

      return [s.playerId, { rank: s[rankKey], value: s[valueKey] }];
    })
  );
}

export { fetchGroupHiscores };
