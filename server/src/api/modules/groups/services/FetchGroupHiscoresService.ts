import { z } from 'zod';
import prisma from '../../../../prisma';
import {
  getMetricMeasure,
  getMetricRankKey,
  getMetricValueKey,
  Metric,
  MetricMeasure,
  getLevel
} from '../../../../utils';
import { omit } from '../../../util/objects';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { NotFoundError } from '../../../errors';
import { GroupHiscoresEntry } from '../group.types';
import { getTotalLevel } from '../../snapshots/snapshot.utils';

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
    include: {
      player: {
        include: {
          latestSnapshot: true
        }
      }
    }
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
  const rankKey = getMetricRankKey(params.metric);
  const valueKey = getMetricValueKey(params.metric);

  return memberships
    .filter(m => !!m.player.latestSnapshot)
    .map(({ player }) => {
      let data: GroupHiscoresEntry['data'];

      const rank = player.latestSnapshot[rankKey];
      const value = player.latestSnapshot[valueKey];

      if (measure === MetricMeasure.EXPERIENCE) {
        const lvl = params.metric === Metric.OVERALL ? getTotalLevel(player.latestSnapshot) : getLevel(value);
        data = { rank, experience: value, level: lvl };
      } else if (measure === MetricMeasure.KILLS) {
        data = { rank, kills: value };
      } else if (measure === MetricMeasure.SCORE) {
        data = { rank, score: value };
      } else {
        data = { rank, value: value };
      }

      return {
        player: omit(player, 'latestSnapshot'),
        data
      };
    })
    .sort((a, b) => b.data[measure] - a.data[measure])
    .slice(params.offset, params.offset + params.limit);
}

export { fetchGroupHiscores };
