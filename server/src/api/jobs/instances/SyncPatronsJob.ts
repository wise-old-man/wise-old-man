import prisma, { Patron } from '../../../prisma';
import { getPatrons } from '../../services/external/patreon.service';
import { JobType, JobDefinition } from '../job.types';

class SyncPatronsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SYNC_PATRONS;
  }

  async execute() {
    const currentPatrons = await prisma.patron.findMany();

    const toAdd: Patron[] = [];
    const toUpdate: Patron[] = [];
    const toDelete: Patron[] = [];

    const patrons = await getPatrons();
    const newIds = patrons.map(p => p.id);

    patrons.forEach(p => {
      const match = currentPatrons.find(cp => cp.id === p.id);

      if (!match) {
        toAdd.push(p);
      } else if (needsUpdate(p, match)) {
        toUpdate.push(p);
      }
    });

    currentPatrons.forEach(p => {
      if (!newIds.includes(p.id)) {
        toDelete.push(p);
      }
    });

    await prisma.$transaction(async transaction => {
      if (toAdd.length > 0) {
        await transaction.patron.createMany({
          data: toAdd
        });
      }

      if (toDelete.length > 0) {
        await transaction.patron.deleteMany({
          where: { id: { in: toDelete.map(p => p.id) } }
        });
      }

      if (toUpdate.length > 0) {
        for (const patron of toUpdate) {
          await transaction.patron.update({
            where: { id: patron.id },
            data: patron
          });
        }
      }
    });
  }
}

function needsUpdate(a: Patron, b: Patron) {
  return (
    a.name !== b.name ||
    a.email !== b.email ||
    a.tier !== b.tier ||
    a.discordId !== b.discordId ||
    a.createdAt.getTime() !== b.createdAt.getTime()
  );
}

export default new SyncPatronsJob();
