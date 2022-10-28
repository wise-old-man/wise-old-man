import { z } from 'zod';
import { omit } from 'lodash';
import { CompetitionStatus } from '../../../../utils';
import { findPlayerParticipations } from './FindPlayerParticipationsService';
import { ParticipationWithCompetitionAndStandings } from '../competition.types';
import { calculateParticipantsStandings } from './FetchCompetitionDetailsService';

const inputSchema = z.object({
  playerId: z.number().int().positive(),
  status: z.enum([CompetitionStatus.ONGOING, CompetitionStatus.FINISHED])
});

type FindPlayerParticipationsParams = z.infer<typeof inputSchema>;

async function findPlayerParticipationsStandings(
  payload: FindPlayerParticipationsParams
): Promise<ParticipationWithCompetitionAndStandings[]> {
  const params = inputSchema.parse(payload);

  const participations = await findPlayerParticipations({
    playerId: params.playerId,
    status: params.status
  });

  const competitionsStandings = await Promise.all(
    participations.map(async p => {
      return {
        competition: p.competition,
        participants: await calculateParticipantsStandings(p.competitionId, p.competition.metric)
      };
    })
  );

  const playerParticipations = competitionsStandings.map(c => {
    const playerIndex = c.participants.findIndex(p => p.playerId === params.playerId);

    if (playerIndex === -1) {
      throw new Error("Player couldn't be found in participations list.");
    }

    const participation = c.participants[playerIndex];

    return {
      ...omit(participation, ['player']),
      competition: c.competition,
      rank: playerIndex + 1,
      progress: participation.progress
    };
  });

  return playerParticipations;
}

export { findPlayerParticipationsStandings };
