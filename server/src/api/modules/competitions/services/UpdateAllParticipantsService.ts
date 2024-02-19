import prisma, { Player } from '../../../../prisma';
import { jobManager, JobType } from '../../../jobs';
import { NotFoundError, BadRequestError } from '../../../errors';

// The first and last 6h of a competition are considered a priority period
const PRIORITY_PERIOD = 6;

// During a priority period, players are considered outdated 1h after their last update
const PRIORITY_COOLDOWN = 1;

// By default, players are considered outdated 24h after their last update
const DEFAULT_COOLDOWN = 24;

type UpdateAllParticipantsResult = { outdatedCount: number; cooldownDuration: number };

async function updateAllParticipants(
  id: number,
  forceUpdate?: boolean
): Promise<UpdateAllParticipantsResult> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.endsAt.getTime() < Date.now()) {
    throw new BadRequestError('This competition has ended. Cannot update all.');
  }

  const hoursTillEnd = Math.max(0, (competition.endsAt.getTime() - Date.now()) / 1000 / 60 / 60);
  const hoursFromStart = Math.max(0, (Date.now() - competition.startsAt.getTime()) / 1000 / 60 / 60);

  const hasPriority =
    hoursTillEnd < PRIORITY_PERIOD || (hoursFromStart < PRIORITY_PERIOD && hoursFromStart > 0);

  const cooldownDuration = hasPriority ? PRIORITY_COOLDOWN : DEFAULT_COOLDOWN;

  const outdatedPlayers = await getOutdatedParticipants(id, forceUpdate ? 0 : cooldownDuration);

  if (!outdatedPlayers || outdatedPlayers.length === 0) {
    throw new BadRequestError(
      `This competition has no outdated participants (updated over ${cooldownDuration}h ago).`
    );
  }

  // Execute the update action for every participant
  outdatedPlayers.forEach(({ username }) => {
    jobManager.add({
      type: JobType.UPDATE_PLAYER,
      payload: { username }
    });
  });

  return { outdatedCount: outdatedPlayers.length, cooldownDuration };
}

async function getOutdatedParticipants(
  competitionId: number,
  cooldownDuration: number
): Promise<Pick<Player, 'username'>[]> {
  const cooldownExpiration = new Date(Date.now() - cooldownDuration * 60 * 60 * 1000);

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

export { updateAllParticipants };
