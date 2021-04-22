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
  NameChange.afterCreate((nameChange: NameChange) => {
    onNameChangeCreated(nameChange);
  });

  Player.afterUpdate((player: Player, options: UpdateOptions) => {
    if (!options.fields) return;

    if (options.fields.includes('username')) {
      onPlayerNameChanged(player, player.previous('displayName'));
    }

    if (options.fields.includes('type')) {
      onPlayerTypeChanged(player, player.previous('type'));
    }
  });

  Player.afterCreate((player: Player) => {
    onPlayerCreated(player);
  });

  Snapshot.afterCreate((snapshot: Snapshot) => {
    onPlayerUpdated(snapshot);
  });

  Snapshot.afterBulkCreate((snapshots: Snapshot[]) => {
    onPlayerImported(snapshots[0].playerId);
  });

  Delta.afterUpdate((delta: Delta) => {
    onDeltaUpdated(delta);
  });

  Delta.afterCreate((delta: Delta) => {
    onDeltaUpdated(delta);
  });

  Membership.afterBulkCreate((memberships: Membership[]) => {
    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    onMembersJoined(groupId, playerIds);
  });

  Membership.afterBulkDestroy((options: DestroyOptions) => {
    if (!options.where) return;

    const { groupId, playerId }: any = options.where;

    if (!playerId || playerId.length === 0) return;

    onMembersLeft(groupId, playerId);
  });

  Achievement.afterBulkCreate((achievements: Achievement[]) => {
    onAchievementsCreated(achievements);
  });

  Competition.beforeUpdate((competition: Competition, options: UpdateOptions) => {
    if (!options || !options.fields) return;
    onCompetitionUpdated(competition, options.fields);
  });

  Competition.afterCreate((competition: Competition) => {
    onCompetitionCreated(competition);
  });
}

export default { setup };
