import prisma from '../../../../prisma';
import redisService from '../../../services/external/redis.service';
import { Period, PeriodProps } from '../../../../utils';

async function blockUserActions(ipHash: string) {
  const dayAgo = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds);

  await prisma.$transaction(async transaction => {
    await transaction.group.deleteMany({
      where: {
        creatorIpHash: ipHash,
        createdAt: {
          gte: dayAgo
        }
      }
    });
    await transaction.competition.deleteMany({
      where: {
        creatorIpHash: ipHash,
        createdAt: {
          gte: dayAgo
        }
      }
    });
  });

  // Block them from making any further requests for 24h
  await redisService.setValue('api-blocked', ipHash, Date.now(), PeriodProps[Period.DAY].milliseconds);
}

export { blockUserActions };
