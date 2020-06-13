import { addJob } from './jobs';
import { Player, Snapshot, Membership } from '../database/models';

function setup() {
  Player.afterCreate(({ username }) => {
    addJob('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
  });

  Snapshot.afterCreate(({ playerId }) => {
    addJob('SyncPlayerAchievements', { playerId });
    addJob('SyncPlayerInitialValues', { playerId });

    // Delay this to ensure SyncPlayerInitialValues runs first
    addJob('SyncPlayerRecords', { playerId }, { delay: 10000 });
  });

  Snapshot.afterBulkCreate(snapshots => {
    if (!snapshots || !snapshots.length) {
      return;
    }

    const { playerId } = snapshots[0];

    addJob('SyncPlayerRecords', { playerId });
    addJob('ReevaluatePlayerAchievements', { playerId });
  });

  Membership.afterBulkCreate(memberships => {
    if (!memberships || !memberships.length) {
      return;
    }

    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    addJob('AddToGroupCompetitions', { groupId, playerIds });
  });

  Membership.afterBulkDestroy((info: any) => {
    if (!info || !info.where) {
      return;
    }

    const { groupId, playerId } = info.where;
    addJob('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });
  });
}

export { setup };
