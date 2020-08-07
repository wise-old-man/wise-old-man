import { UpdateOptions } from 'sequelize/types';
import { Achievement, Competition, Membership, Player, Snapshot } from '../database';
import {
  onAchievementsCreated,
  onCompetitionCreated,
  onCompetitionUpdated,
  onMembersJoined,
  onMembersLeft,
  onPlayerCreated,
  onPlayerImported,
  onPlayerNameChanged,
  onPlayerUpdated
} from './events';

function setup() {
  Player.afterUpdate((player: Player, options: UpdateOptions) => {
    if (options.fields && options.fields.includes('username')) {
      onPlayerNameChanged(player);
    }
  });

  Player.afterCreate(({ username }) => {
    onPlayerCreated(username);
  });

  Snapshot.afterCreate(({ playerId }) => {
    onPlayerUpdated(playerId);
  });

  Snapshot.afterBulkCreate(snapshots => {
    if (!snapshots || snapshots.length === 0) return;
    onPlayerImported(snapshots[0].playerId);
  });

  Membership.afterBulkCreate(memberships => {
    if (!memberships || !memberships.length) return;

    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    onMembersJoined(groupId, playerIds);
  });

  Membership.afterBulkDestroy(info => {
    if (!info || !info.where) return;

    const { groupId, playerId }: any = info.where;

    if (!playerId || playerId.length === 0) return;

    onMembersLeft(groupId, playerId);
  });

  Achievement.afterBulkCreate(async achievements => {
    if (!achievements || achievements.length === 0) return;
    onAchievementsCreated(achievements);
  });

  Competition.beforeUpdate((competition, options) => {
    if (!options || !options.fields) return;
    onCompetitionUpdated(competition, options.fields);
  });

  Competition.afterCreate(competition => {
    onCompetitionCreated(competition);
  });
}

export default { setup };
