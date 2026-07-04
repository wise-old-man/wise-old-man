import { AsyncResult, complete, errored } from '@attio/fetchable';
import ms from 'ms';
import { JobType, jobManager } from '../../../../jobs';
import prisma from '../../../../prisma';
import { Player } from '../../../../types';

// The first and last 6h of a competition are considered a priority period
const PRIORITY_PERIOD = 6;

// During a priority period, players are considered outdated 1h after their last update
const PRIORITY_COOLDOWN = 1;

// By default, players are considered outdated 24h after their last update
const DEFAULT_COOLDOWN = 24;

const GRACE_PERIOD = ms('30 min');

export async function updateAllParticipants(
  id: number,
  forceUpdate?: boolean
): AsyncResult<
  { outdatedCount: number; cooldownDuration: number },
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'COMPETITION_ENDED' }
  | { code: 'NO_OUTDATED_PARTICIPANTS'; data: { cooldownDuration: number } }
> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (competition.endsAt.getTime() < Date.now()) {
    return errored({ code: 'COMPETITION_ENDED' });
  }

  const hoursTillEnd = Math.max(0, (competition.endsAt.getTime() - Date.now()) / 1000 / 60 / 60);
  const hoursFromStart = Math.max(0, (Date.now() - competition.startsAt.getTime()) / 1000 / 60 / 60);

  const hasPriority =
    hoursTillEnd < PRIORITY_PERIOD || (hoursFromStart < PRIORITY_PERIOD && hoursFromStart > 0);

  const cooldownDuration = hasPriority ? PRIORITY_COOLDOWN : DEFAULT_COOLDOWN;

  const outdatedPlayers = await getOutdatedParticipants(id, forceUpdate ? 0 : cooldownDuration);

  if (outdatedPlayers.length === 0) {
    return errored({
      code: 'NO_OUTDATED_PARTICIPANTS',
      data: { cooldownDuration }
    });
  }

  // Schedule an update job for every participant
  for (const player of outdatedPlayers) {
    jobManager.add(JobType.UPDATE_PLAYER, { username: player.username });
  }

  return complete({
    outdatedCount: outdatedPlayers.length,
    cooldownDuration
  });
}

async function getOutdatedParticipants(
  competitionId: number,
  cooldownDuration: number
): Promise<Pick<Player, 'username'>[]> {
  const cooldownExpiration = new Date(Date.now() - cooldownDuration * ms('1 hour') + GRACE_PERIOD);

  const outdatedParticipants = await prisma.participation.findMany({
    where: {
      competitionId,
      player: {
        OR: [{ updatedAt: { lt: cooldownExpiration } }, { updatedAt: null }]
      }
    },
    include: {
      player: { select: { username: true } }
    }
  });

  return outdatedParticipants.map(o => o.player);
}
