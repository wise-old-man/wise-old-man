import * as jobs from './jobs';
import { Player, Snapshot, Membership } from '../database';

function setup() {
  Player.afterCreate(({ username }) => {
    jobs.add('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
  });

  Snapshot.afterCreate(({ playerId }) => {
    jobs.add('SyncPlayerAchievements', { playerId });
    jobs.add('SyncPlayerInitialValues', { playerId });

    // Delay this to ensure SyncPlayerInitialValues runs first
    jobs.add('SyncPlayerRecords', { playerId }, { delay: 10000 });
  });

  Snapshot.afterBulkCreate(snapshots => {
    if (!snapshots || !snapshots.length) {
      return;
    }

    const { playerId } = snapshots[0];

    jobs.add('SyncPlayerRecords', { playerId });
    jobs.add('ReevaluatePlayerAchievements', { playerId });
  });

  Membership.afterBulkCreate(memberships => {
    if (!memberships || !memberships.length) {
      return;
    }

    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    jobs.add('AddToGroupCompetitions', { groupId, playerIds });
  });

  Membership.afterBulkDestroy(info => {
    if (!info || !info.where) {
      return;
    }

    const { groupId, playerId } = info.where;
    jobs.add('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });
  });
}

export { setup };