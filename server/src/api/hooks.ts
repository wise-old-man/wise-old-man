import { DestroyOptions, UpdateOptions } from 'sequelize/types';
import { Competition, Delta, Membership, Participation, Player, Snapshot } from '../database/models';
import { onCompetitionCreated, onParticipantsJoined } from './events/competition.events';
import { onDeltaUpdated } from './events/delta.events';
import { onMembersJoined, onMembersLeft } from './events/group.events';
import {
  onPlayerImported,
  onPlayerNameChanged,
  onPlayerTypeChanged,
  onPlayerUpdated
} from './events/player.events';

function setup() {
  Player.afterUpdate((player: Player, options: UpdateOptions) => {
    if (!options.fields) return;

    if (options.fields.includes('username')) {
      onPlayerNameChanged(player, player.previous('displayName'));
    }

    if (options.fields.includes('type')) {
      onPlayerTypeChanged(player, player.previous('type'));
    }
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

  Participation.afterBulkCreate((participations: Participation[]) => {
    const { competitionId } = participations[0];
    const playerIds = participations.map(m => m.playerId);

    onParticipantsJoined(competitionId, playerIds);
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

  Competition.afterCreate((competition: Competition) => {
    onCompetitionCreated(competition);
  });
}

export default { setup };
