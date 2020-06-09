import { add } from './jobs';
import { Player, Snapshot, Membership } from '../database/models';

function setup() {
  Player.afterCreate(({ username }) => {
    add('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
  });

  Snapshot.afterCreate(({ playerId }) => {
    add('SyncPlayerAchievements', { playerId });
    add('SyncPlayerInitialValues', { playerId });

    // Delay this to ensure SyncPlayerInitialValues runs first
    add('SyncPlayerRecords', { playerId }, { delay: 10000 });
  });

  Snapshot.afterBulkCreate(snapshots => {
    if (!snapshots || !snapshots.length) {
      return;
    }

    const { playerId } = snapshots[0];

    add('SyncPlayerRecords', { playerId });
    add('ReevaluatePlayerAchievements', { playerId });
  });

  Membership.afterBulkCreate(memberships => {
    if (!memberships || !memberships.length) {
      return;
    }

    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    add('AddToGroupCompetitions', { groupId, playerIds });
  });

  Membership.afterBulkDestroy((info: any) => {
    if (!info || !info.where) {
      return;
    }

    const { groupId, playerId } = info.where;
    add('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });
  });
}

export { setup };