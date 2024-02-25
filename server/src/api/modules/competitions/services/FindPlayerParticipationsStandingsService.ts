import { omit } from '../../../util/objects';
import { findPlayerParticipations } from './FindPlayerParticipationsService';
import { ParticipationWithCompetitionAndStandings } from '../competition.types';
import { calculateParticipantsStandings } from './FetchCompetitionDetailsService';
import { CompetitionStatus } from '../../../../utils';
import { standardize } from '../../players/player.utils';

async function findPlayerParticipationsStandings(
  username: string,
  status: CompetitionStatus
): Promise<ParticipationWithCompetitionAndStandings[]> {
  const participations = await findPlayerParticipations(username, status);

  const competitionsStandings = await Promise.all(
    participations.map(async p => {
      return {
        competition: p.competition,
        participants: await calculateParticipantsStandings(p.competitionId, p.competition.metric)
      };
    })
  );

  const playerParticipations = competitionsStandings.map(c => {
    const playerIndex = c.participants.findIndex(p => p.player.username === standardize(username));

    if (playerIndex === -1) {
      throw new Error("Player couldn't be found in participations list.");
    }

    const participation = c.participants[playerIndex];

    return {
      ...omit(participation, 'player'),
      competition: c.competition,
      rank: playerIndex + 1,
      progress: participation.progress,
      levels: participation.levels
    };
  });

  return playerParticipations;
}

export { findPlayerParticipationsStandings };
