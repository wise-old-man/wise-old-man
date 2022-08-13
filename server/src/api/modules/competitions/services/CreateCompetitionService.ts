import { z } from 'zod';
import prisma, { modifyPlayer } from '../../../../prisma';
import { CompetitionType, Metric } from '../../../../utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import * as playerServices from '../../players/player.services';
import * as cryptService from '../../../services/external/crypt.service';
import { CompetitionWithParticipations, Team } from '../competition.types';
import {
  sanitizeTitle,
  sanitizeTeams,
  validateTeamDuplicates,
  validateInvalidParticipants,
  validateParticipantDuplicates
} from '../competition.utils';
import { omit } from 'lodash';

const INVALID_TYPE_ERROR =
  'Invalid teams list. Must be an array of { name: string; participants: string[]; }.';

const TEAM_INPUT_SCHEMA = z.object(
  {
    name: z
      .string({
        required_error: INVALID_TYPE_ERROR,
        invalid_type_error: INVALID_TYPE_ERROR
      })
      .min(1, 'Team names must have at least one character.')
      .max(30, 'Team names cannot be longer than 30 characters.'),
    participants: z
      .array(z.string(), {
        invalid_type_error: INVALID_TYPE_ERROR,
        required_error: INVALID_TYPE_ERROR
      })
      .nonempty({ message: 'All teams must have a valid non-empty participants array.' })
  },
  {
    invalid_type_error: INVALID_TYPE_ERROR
  }
);

const inputSchema = z
  .object({
    title: z
      .string({ required_error: "Parameter 'title' is undefined." })
      .min(1, 'Competition title must have at least one character.')
      .max(50, 'Competition title cannot be longer than 50 characters.'),
    metric: z.nativeEnum(Metric),
    startsAt: z.date({
      invalid_type_error: "Parameter 'startsAt' is not a valid date.",
      required_error: "Parameter 'startsAt' is undefined."
    }),
    endsAt: z.date({
      invalid_type_error: "Parameter 'endsAt' is not a valid date.",
      required_error: "Parameter 'endsAt' is undefined."
    }),
    groupId: z.number().int().positive().optional(),
    groupVerificationCode: z.string().optional(),
    participants: z
      // Allowing "any" so that we could do better error messages below
      .array(z.string().or(z.any()).optional(), {
        invalid_type_error: "Parameter 'participants' is not a valid array.",
        required_error: "Parameter 'participants' is undefined."
      })
      .optional(),
    teams: z
      .array(TEAM_INPUT_SCHEMA, { invalid_type_error: "Parameter 'teams' is not a valid array." })
      .optional()
  })
  .refine(s => !(s.endsAt.getTime() < s.startsAt.getTime()), {
    message: 'Start date must be before the end date.'
  })
  .refine(s => !(s.startsAt.getTime() < Date.now() || s.endsAt.getTime() < Date.now()), {
    message: 'Invalid dates: All start and end dates must be in the future.'
  })
  .refine(s => !(s.participants && s.participants.length > 0 && !!s.groupId), {
    message: `Cannot include both "participants" and "groupId", they are mutually exclusive. 
    All group members will be registered as participants instead.`
  })
  .refine(s => !(s.participants && s.participants.length > 0 && s.teams && s.teams.length > 0), {
    message: 'Cannot include both "participants" and "teams", they are mutually exclusive.'
  });

type CreateCompetitionParams = z.infer<typeof inputSchema>;
type CreateCompetitionResult = { competition: CompetitionWithParticipations; verificationCode: string };

async function createCompetition(payload: CreateCompetitionParams): Promise<CreateCompetitionResult> {
  const params = inputSchema.parse(payload);

  const isGroupCompetition = !!params.groupId;
  const isTeamCompetition = params.teams && params.teams.length > 0;
  const hasParticipants = params.participants && params.participants.length > 0;

  let participations: { playerId: number; teamName?: string }[] = [];

  if (hasParticipants) {
    // throws an error if any participant is invalid
    validateInvalidParticipants(params.participants);
    // throws an error if any participant is duplicated
    validateParticipantDuplicates(params.participants);

    participations = await getParticipations(params.participants);
  }

  if (isTeamCompetition) {
    // ensures every team name is sanitized, and every username is standardized
    const teams = sanitizeTeams(params.teams);
    // throws an error if any team name is duplicated
    validateTeamDuplicates(teams);
    // throws an error if any team participant is invalid
    validateInvalidParticipants(teams.map(t => t.participants).flat());
    // throws an error if any team participant is duplicated
    validateParticipantDuplicates(teams.map(t => t.participants).flat());

    participations = await getTeamsParticipations(teams);
  }

  if (isGroupCompetition) {
    // throws errors if the verification code doesn't match the group's hash
    await validateGroupVerification(params.groupId, params.groupVerificationCode);

    if (!isTeamCompetition) {
      participations = await getGroupParticipations(params.groupId);
    }
  }

  const [code, hash] = await cryptService.generateVerification();

  const createdCompetition = await prisma.competition.create({
    data: {
      title: sanitizeTitle(params.title),
      metric: params.metric,
      type: isTeamCompetition ? CompetitionType.TEAM : CompetitionType.CLASSIC,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      groupId: params.groupId,
      verificationHash: hash,

      participations: {
        createMany: {
          data: participations
        }
      }
    },
    include: {
      group: {
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        }
      },
      participations: {
        include: {
          player: true
        }
      }
    }
  });

  return {
    competition: {
      ...omit(createdCompetition, 'verificationHash'),
      group: createdCompetition.group
        ? {
            ...omit(createdCompetition.group, '_count', 'verificationHash'),
            memberCount: createdCompetition.group._count.memberships
          }
        : undefined,
      participantCount: createdCompetition.participations.length,
      participations: createdCompetition.participations.map(p => ({
        ...omit(p, 'startSnapshotId', 'endSnapshotId'),
        player: modifyPlayer(p.player)
      }))
    },
    verificationCode: code
  };
}

async function getParticipations(participants: string[]) {
  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: participants,
    createIfNotFound: true
  });

  return players.map(p => ({ playerId: p.id, teamName: null }));
}

async function getTeamsParticipations(teams: Team[]) {
  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: teams.map(t => t.participants).flat(),
    createIfNotFound: true
  });

  // Map player usernames into IDs, for O(1) checks below
  const playerMap = Object.fromEntries(players.map(p => [p.username, p.id]));

  return teams.map(t => t.participants.map(u => ({ teamName: t.name, playerId: playerMap[u] }))).flat();
}

async function getGroupParticipations(groupId: number) {
  const memberships = await prisma.membership.findMany({
    where: { groupId },
    select: { playerId: true }
  });

  return memberships.map(m => ({ playerId: m.playerId, teamName: null }));
}

async function validateGroupVerification(groupId: number, groupVerificationCode: string) {
  if (!groupVerificationCode) {
    throw new BadRequestError('Invalid group verification code.');
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId },
    select: { verificationHash: true }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  const verified = await cryptService.verifyCode(group.verificationHash, groupVerificationCode);

  if (!verified) {
    throw new ForbiddenError('Incorrect group verification code.');
  }
}

export { createCompetition };
