import { UpdateOptions } from 'sequelize/types';
import { Competition, Participation, Player } from '../database/models';
import { onCompetitionCreated, onParticipantsJoined } from './modules/competitions/competition.events';

import { onPlayerNameChanged } from './modules/players/player.events';

function setup() {
  Player.afterUpdate((player: Player, options: UpdateOptions) => {
    if (!options.fields) return;

    if (options.fields.includes('username')) {
      onPlayerNameChanged(player, player.previous('displayName'));
    }
  });

  Participation.afterBulkCreate((participations: Participation[]) => {
    const { competitionId } = participations[0];
    const playerIds = participations.map(m => m.playerId);

    onParticipantsJoined(competitionId, playerIds);
  });

  Competition.afterCreate((competition: Competition) => {
    onCompetitionCreated(competition);
  });
}

export default { setup };
