import { z } from 'zod';
import prisma, { Player } from '../../../../prisma';
import { NotFoundError, BadRequestError } from '../../../errors';
import jobs from '../../../jobs';

// The first and last 6h of a competition are considered a priority period
const PRIORITY_PERIOD = 6;

// During a priority period, players are considered outdated 1h after their last update
const PRIORITY_COOLDOWN = 1;

// By default, players are considered outdated 24h after their last update
const DEFAULT_COOLDOWN = 24;

const inputSchema = z.object({
  competitionId: z.number().positive(),
  forcedUpdate: z.boolean().optional().default(false)
});

type UpdateAllParticipantsParams = z.infer<typeof inputSchema>;
type UpdateAllParticipantsResult = { outdatedCount: number; cooldownDuration: number };

async function updateAllParticipants(
  payload: UpdateAllParticipantsParams
): Promise<UpdateAllParticipantsResult> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.competitionId }
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

  const outdatedPlayers = await getOutdatedParticipants(
    params.competitionId,
    params.forcedUpdate ? 0 : cooldownDuration
  );

  if (!outdatedPlayers || outdatedPlayers.length === 0) {
    throw new BadRequestError(
      `This competition has no outdated participants (updated over ${cooldownDuration}h ago).`
    );
  }

  // Execute the update action for every participant
  outdatedPlayers.forEach(({ username }) => {
    jobs.add('UpdatePlayer', {
      username,
      source: params.forcedUpdate ? 'Competition:OnCompetitionStarted' : 'Competition:UpdateAll'
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
        updatedAt: { lt: cooldownExpiration }
      }
    },
    include: {
      player: { select: { username: true } }
    }
  });

  return outdatedParticipants.map(o => o.player);
}

export { updateAllParticipants };
