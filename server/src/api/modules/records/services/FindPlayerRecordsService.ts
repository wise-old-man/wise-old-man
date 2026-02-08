import prisma, { PrismaTypes } from '../../../../prisma';
import { Metric, Period, Record } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerRecords(username: string, period?: Period, metric?: Metric): Promise<Record[]> {
  const query: PrismaTypes.RecordWhereInput = {
    player: {
      username: standardizeUsername(username)
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
      where: { username: standardizeUsername(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return records;
}

export { findPlayerRecords };
