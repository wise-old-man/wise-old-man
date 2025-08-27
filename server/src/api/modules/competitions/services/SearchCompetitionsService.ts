import prisma, { PrismaTypes } from '../../../../prisma';
import {
  Competition,
  CompetitionMetric,
  CompetitionStatus,
  CompetitionType,
  Group,
  Metric
} from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

async function searchCompetitions(
  title: string | undefined,
  metric: Metric | undefined,
  type: CompetitionType | undefined,
  status: CompetitionStatus | undefined,
  pagination: PaginationOptions
): Promise<
  Array<{
    competition: Competition & { metrics: CompetitionMetric[]; participantCount: number };
    group: (Group & { memberCount: number }) | null;
  }>
> {
  const query: PrismaTypes.CompetitionWhereInput = {};

  if (type) {
    query.type = type;
  }

  if (metric) {
    query.metrics = {
      some: {
        metric
      }
    };
  }

  if (title) {
    query.title = {
      contains: title.trim(),
      mode: 'insensitive'
    };
  }

  if (status) {
    const now = new Date();

    if (status === CompetitionStatus.FINISHED) {
      query.endsAt = { lt: now };
    } else if (status === CompetitionStatus.UPCOMING) {
      query.startsAt = { gt: now };
    } else if (status === CompetitionStatus.ONGOING) {
      query.startsAt = { lt: now };
      query.endsAt = { gt: now };
    }
  }

  const competitions = await prisma.competition.findMany({
    where: { ...query },
    include: {
      group: {
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        }
      },
      metrics: {
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  const participantCounts = await prisma.participation.groupBy({
    by: ['competitionId'],
    where: {
      competitionId: {
        in: competitions.map(c => c.id)
      }
    },
    _count: true
  });

  const participantCountsMap = new Map<number, number>();
  for (const { competitionId, _count } of participantCounts) {
    participantCountsMap.set(competitionId, _count);
  }

  return competitions.map(({ group, ...competition }) => {
    return {
      competition: {
        ...competition,
        participantCount: participantCountsMap.get(competition.id) ?? 0
      },
      group: group
        ? {
            ...group,
            memberCount: group._count.memberships
          }
        : null
    };
  });
}

export { searchCompetitions };
