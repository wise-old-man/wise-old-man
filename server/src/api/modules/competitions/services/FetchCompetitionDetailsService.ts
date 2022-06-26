import { omit } from 'lodash';
import { z } from 'zod';
import prisma, { modifyPlayer, modifySnapshot } from '../../../../prisma';
import { getMetricValueKey, isVirtualMetric, Metric } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { CompetitionDetails } from '../competition.types';
import * as deltaUtils from '../../deltas/delta.utils';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    metric: z.nativeEnum(Metric).optional()
  })
  .merge(PAGINATION_SCHEMA);

type FetchCompetitionDetailsParams = z.infer<typeof inputSchema>;

async function fetchCompetitionDetails(payload: FetchCompetitionDetailsParams): Promise<CompetitionDetails> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  const competitionMetric = params.metric || competition.metric;
  const metricKey = getMetricValueKey(competitionMetric);
  const isVirtual = isVirtualMetric(competitionMetric);

  const requiredSnapshotFields = isVirtual ? true : { select: { [metricKey]: true } };

  const participations = await prisma.participation.findMany({
    where: { competitionId: params.id },
    include: {
      player: true,
      startSnapshot: requiredSnapshotFields,
      endSnapshot: requiredSnapshotFields
    }
  });

  const participants = participations
    .map(p => {
      const { player, startSnapshot, endSnapshot } = p;
      const modifiedPlayer = modifyPlayer(player);

      const diff = deltaUtils.calculateMetricDelta(
        modifiedPlayer,
        competitionMetric,
        modifySnapshot(startSnapshot),
        modifySnapshot(endSnapshot)
      );

      return {
        ...omit(p, ['startSnapshotId', 'endSnapshotId', 'startSnapshot', 'endSnapshot']),
        player: modifiedPlayer,
        progress: diff
      };
    })
    .sort((a, b) => b.progress.gained - a.progress.gained || b.progress.start - a.progress.start);

  return {
    ...omit(competition, ['verificationHash']),
    participantCount: participants.length,
    participations: participants
  };
}

export { fetchCompetitionDetails };
