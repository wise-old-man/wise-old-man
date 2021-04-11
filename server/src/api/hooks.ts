import { DestroyOptions, UpdateOptions } from 'sequelize/types';
import {
  Achievement,
  Competition,
  Delta,
  Membership,
  NameChange,
  Player,
  Snapshot
} from '../database/models';
import { onAchievementsCreated } from './events/achievement.events';
import { onCompetitionCreated, onCompetitionUpdated } from './events/competition.events';
import { onDeltaUpdated } from './events/delta.events';
import { onMembersJoined, onMembersLeft } from './events/group.events';
import { onNameChangeCreated } from './events/name.events';
import {
  onPlayerCreated,
  onPlayerImported,
  onPlayerNameChanged,
  onPlayerTypeChanged,
  onPlayerUpdated
} from './events/player.events';

function setup() {
  NameChange.afterCreate(async (nameChange: NameChange) => {
    await onNameChangeCreated(nameChange);
  });

  Player.afterUpdate(async (player: Player, options: UpdateOptions) => {
    if (!options.fields) return;

    if (options.fields.includes('username')) {
      await onPlayerNameChanged(player, player.previous('displayName'));
    }

    if (options.fields.includes('type')) {
      await onPlayerTypeChanged(player, player.previous('type'));
    }
  });

  Player.afterCreate(async (player: Player) => {
    await onPlayerCreated(player);
  });

  Snapshot.afterCreate(async (snapshot: Snapshot) => {
    await onPlayerUpdated(snapshot);
  });

  Snapshot.afterBulkCreate(async (snapshots: Snapshot[]) => {
    await onPlayerImported(snapshots[0].playerId);
  });

  Delta.afterUpdate(async (delta: Delta) => {
    await onDeltaUpdated(delta);
  });

  Delta.afterCreate(async (delta: Delta) => {
    await onDeltaUpdated(delta);
  });

  Membership.afterBulkCreate(async (memberships: Membership[]) => {
    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    await onMembersJoined(groupId, playerIds);
  });

  Membership.afterBulkDestroy(async (options: DestroyOptions) => {
    if (!options.where) return;

    const { groupId, playerId }: any = options.where;

    if (!playerId || playerId.length === 0) return;

    await onMembersLeft(groupId, playerId);
  });

  Achievement.afterBulkCreate(async (achievements: Achievement[]) => {
    await onAchievementsCreated(achievements);
  });

  Competition.beforeUpdate(async (competition: Competition, options: UpdateOptions) => {
    if (!options || !options.fields) return;
    await onCompetitionUpdated(competition, options.fields);
  });

  Competition.afterCreate(async (competition: Competition) => {
    await onCompetitionCreated(competition);
  });
}

export default { setup };
