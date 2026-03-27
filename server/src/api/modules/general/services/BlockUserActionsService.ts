import ms from 'ms';
import prisma from '../../../../prisma';
import { buildCompoundRedisKey, redisClient } from '../../../../services/redis.service';
import { Period } from '../../../../types';
import { PeriodProps } from '../../../../utils/shared';

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
  await redisClient.set(buildCompoundRedisKey('api_blocked', ipHash), Date.now(), 'PX', ms('24 hours'));
}

export { blockUserActions };
