import { Participation } from '../../../database/models';
import * as snapshotService from '../../services/internal/snapshot.service';
import { Job } from '../index';

class RevalidateParticipation implements Job {
  name: string;

  constructor() {
    this.name = 'RevalidateParticipation';
  }

  async handle(data: any): Promise<void> {
    const { playerId, competitionId, startsAt, endsAt } = data;
    const startSnapshot = await snapshotService.findFirstSince(playerId, startsAt);

    if (!startSnapshot) return;

    const endSnapshot = await snapshotService.findLastBefore(playerId, endsAt);

    if (!endSnapshot) return;

    await Participation.update(
      { startSnapshotId: startSnapshot.id, endSnapshotId: endSnapshot.id },
      { where: { playerId, competitionId } }
    );
  }
}

export default new RevalidateParticipation();
