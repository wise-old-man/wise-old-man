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

export async function searchCompetitions(
  filter: {
    title: string | undefined;
    metrics: Array<Metric> | undefined;
    type: CompetitionType | undefined;
    status: CompetitionStatus | undefined;
  },
  pagination: PaginationOptions
): Promise<
  Array<{
    competition: Competition & { metrics: CompetitionMetric[]; participantCount: number };
    group: (Group & { memberCount: number }) | null;
  }>
> {
  const conditions: Array<PrismaTypes.CompetitionWhereInput> = [];

  if (filter.type) {
    conditions.push({
      type: filter.type
    });
  }

  if (filter.metrics) {
    for (const metric of filter.metrics) {
      conditions.push({
        metrics: {
          some: {
            metric
          }
        }
      });
    }
  }

  if (filter.title) {
    conditions.push({
      title: {
        contains: filter.title.trim(),
        mode: 'insensitive'
      }
    });
  }

  if (filter.status) {
    const now = new Date();

    if (filter.status === CompetitionStatus.FINISHED) {
      conditions.push({
        endsAt: { lt: now }
      });
    } else if (filter.status === CompetitionStatus.UPCOMING) {
      conditions.push({
        startsAt: { gt: now }
      });
    } else if (filter.status === CompetitionStatus.ONGOING) {
      conditions.push({
        startsAt: { lt: now },
        endsAt: { gt: now }
      });
    }
  }

  const competitions = await prisma.competition.findMany({
    where: { AND: conditions },
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
