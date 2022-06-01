import { z } from 'zod';
import prisma, { modifyPlayer } from '../../../../prisma';
import { GroupRole, PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import * as cryptService from '../../../services/external/crypt.service';
import { BadRequestError, ServerError } from '../../../errors';
import { GroupWithMemberships } from '../group.types';
import { isValidUsername, sanitize, standardize } from '../../players/player.utils';
import * as playerServices from '../../players/player.services';
import { sanitizeName } from '../group.utils';
import { omit } from 'lodash';

const MIN_NAME_ERROR = 'Group name must have at least one character.';

const MAX_NAME_ERROR = 'Group name cannot be longer than 30 characters.';

const MAX_DESCRIPTION_ERROR = 'Description cannot be longer than 100 characters.';

const INVALID_MEMBERS_ARRAY_ERROR = "Parameter 'members' is not a valid array.";

const INVALID_MEMBER_OBJECT_ERROR =
  'Invalid members list. Must be an array of { username: string; role?: string; }.';

const INVALID_CLAN_CHAT_ERROR =
  "Invalid 'clanChat'. Must be 1-12 character long, contain no special characters and/or contain no space at the beginning or end of the name.";

const MEMBER_INPUT_SCHEMA = z.object(
  {
    username: z.string(),
    role: z.nativeEnum(GroupRole).optional().default(GroupRole.MEMBER)
  },
  { invalid_type_error: INVALID_MEMBER_OBJECT_ERROR }
);

const inputSchema = z
  .object({
    name: z.string().min(1, MIN_NAME_ERROR).max(30, MAX_NAME_ERROR),
    clanChat: z.string().optional(),
    homeworld: z.number().int().positive().optional(),
    description: z.string().max(100, MAX_DESCRIPTION_ERROR).optional(),
    members: z.array(MEMBER_INPUT_SCHEMA, { invalid_type_error: INVALID_MEMBERS_ARRAY_ERROR })
  })
  .refine(s => !s.clanChat || isValidUsername(s.clanChat), {
    message: INVALID_CLAN_CHAT_ERROR
  });

type CreateGroupParams = z.infer<typeof inputSchema>;
type CreateGroupResult = { group: GroupWithMemberships; verificationCode: string };

async function createGroup(payload: CreateGroupParams): Promise<CreateGroupResult> {
  const params = inputSchema.parse(payload);

  const name = sanitizeName(params.name);
  const description = params.description ? sanitizeName(params.description) : null;
  const clanChat = params.clanChat ? sanitize(params.clanChat) : null;

  const invalidUsernames = params.members.map(m => m.username).filter(u => !isValidUsername(u));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  // Check for duplicate names
  const duplicateGroup = await prisma.group.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });

  if (duplicateGroup) {
    throw new BadRequestError(`Group name '${name}' is already taken.`);
  }

  const [code, hash] = await cryptService.generateVerification();
  const memberships = await prepareMemberships(params.members);

  const createdGroup = await prisma.group.create({
    data: {
      name,
      description,
      clanChat,
      homeworld: params.homeworld,
      verificationHash: hash,

      memberships: {
        createMany: {
          data: memberships
        }
      }
    },
    include: {
      memberships: {
        include: {
          player: true
        }
      }
    }
  });

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  const sortedMemberships = createdGroup.memberships
    .map(m => ({ ...m, player: modifyPlayer(m.player) }))
    .sort((a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role));

  return {
    group: {
      ...omit(createdGroup, ['verificationHash']),
      memberCount: sortedMemberships.length,
      memberships: sortedMemberships
    },
    verificationCode: code
  };
}

async function prepareMemberships(members: CreateGroupParams['members']) {
  if (!members || members.length === 0) return [];

  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: members.map(member => member.username),
    createIfNotFound: true
  });

  const usernameMap: { [username: string]: GroupRole } = {};

  members.forEach(member => {
    usernameMap[standardize(member.username)] = member.role;
  });

  const memberships: { playerId: number; role: GroupRole }[] = [];

  players.forEach(player => {
    const role = usernameMap[player.username];

    if (!role) {
      throw new ServerError('Failed to construct memberships (CreateGroupService)');
    }

    memberships.push({ playerId: player.id, role });
  });

  return memberships;
}

export { createGroup };
