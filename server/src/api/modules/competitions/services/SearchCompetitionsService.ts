import prisma, { PrismaTypes } from '../../../../prisma';
import { CompetitionStatus, CompetitionType, Metric } from '../../../../utils';
import { omit } from '../../../util/objects';
import { PaginationOptions } from '../../../util/validation';
import { CompetitionListItem } from '../competition.types';

async function searchCompetitions(
  title: string | undefined,
  metric: Metric | undefined,
  type: CompetitionType | undefined,
  status: CompetitionStatus | undefined,
  pagiation: PaginationOptions
): Promise<CompetitionListItem[]> {
  const query: PrismaTypes.CompetitionWhereInput = {};

  if (type) query.type = type;
  if (metric) query.metric = metric;
  if (title) query.title = { contains: title.trim(), mode: 'insensitive' };

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
      }
    },
    orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    take: pagiation.limit,
    skip: pagiation.offset
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

  return competitions.map(g => {
    return {
      ...omit(g, 'verificationHash'),
      group: g.group
        ? {
            ...omit(g.group, '_count', 'verificationHash'),
            memberCount: g.group._count.memberships
          }
        : undefined,
      participantCount: participantCountsMap.get(g.id) ?? 0
    };
  });
}

export { searchCompetitions };
