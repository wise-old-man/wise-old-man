import prisma from '../../../../prisma';
import { Period, PeriodProps } from '../../../../utils/shared/period.utils';

async function allowUserActions(ipHash: string) {
  const dayAgo = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds);

  await prisma.$transaction(async transaction => {
    await transaction.group.updateMany({
      where: {
        visible: false,
        creatorIpHash: ipHash,
        createdAt: {
          gte: dayAgo
        }
      },
      data: {
        visible: true
      }
    });
    await transaction.competition.updateMany({
      where: {
        visible: false,
        creatorIpHash: ipHash,
        createdAt: {
          gte: dayAgo
        }
      },
      data: {
        visible: true
      }
    });
  });
}

export { allowUserActions };
