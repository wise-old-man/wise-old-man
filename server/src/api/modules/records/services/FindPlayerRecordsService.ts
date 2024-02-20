import prisma, { PrismaTypes, Record } from '../../../../prisma';
import { Metric, Period } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function findPlayerRecords(username: string, period?: Period, metric?: Metric): Promise<Record[]> {
  const query: PrismaTypes.RecordWhereInput = {
    player: {
      username: standardize(username)
    }
  };

  if (period) query.period = period;
  if (metric) query.metric = metric;

  const records = await prisma.record.findMany({
    where: { ...query },
    orderBy: { updatedAt: 'desc' }
  });

  if (records.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return records;
}

export { findPlayerRecords };
