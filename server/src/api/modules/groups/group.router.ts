import { Router } from 'express';
import { z } from 'zod';
import logger from '../../../services/logging.service';
import { GroupRole, Metric, Period } from '../../../types';
import {
  formatAchievementResponse,
  formatCompetitionResponse,
  formatGroupDetailsResponse,
  formatGroupHiscoresEntryResponse,
  formatGroupResponse,
  formatMemberActivityResponse,
  formatMembershipResponse,
  formatNameChangeResponse,
  formatPlayerResponse,
  formatRecordResponse
} from '../../responses';
import { checkAdminPermission, checkGroupVerificationCode } from '../../util/middlewares';
import { getRequestIpHash } from '../../util/request';
import { executeRequest, validateRequest } from '../../util/routing';
import {
  getDateSchema,
  getPaginationSchema,
  groupRoleOrderSchema,
  memberSchema,
  socialLinksSchema
} from '../../util/validation';
import { findGroupAchievements } from '../achievements/services/FindGroupAchievementsService';
import { findGroupCompetitions } from '../competitions/services/FindGroupCompetitionsService';
import { findGroupDeltas } from '../deltas/services/FindGroupDeltasService';
import { findGroupNameChanges } from '../name-changes/services/FindGroupNameChangesService';
import { findGroupRecords } from '../records/services/FindGroupRecordsService';
import { addMembers } from './services/AddMembersService';
import { changeMemberRole } from './services/ChangeMemberRoleService';
import { createGroup } from './services/CreateGroupService';
import { deleteGroup } from './services/DeleteGroupService';
import { editGroup } from './services/EditGroupService';
import { fetchGroupActivity } from './services/FetchGroupActivityService';
import { fetchGroupDetails } from './services/FetchGroupDetailsService';
import { fetchGroupHiscores } from './services/FetchGroupHiscoresService';
import { fetchGroupStatistics } from './services/FetchGroupStatisticsService';
import { fetchGroupMembersCSV } from './services/FetchMembersCSVService';
import { removeMembers } from './services/RemoveMembersService';
import { resetGroupCode } from './services/ResetGroupCodeService';
import { searchGroups } from './services/SearchGroupsService';
import { updateAllMembers } from './services/UpdateAllMembersService';
import { verifyGroup } from './services/VerifyGroupService';

const router = Router();

router.get(
  '/groups',
  validateRequest({
    query: z
      .object({
        name: z.optional(z.string())
      })
      .merge(getPaginationSchema())
  }),
  executeRequest(async (req, res) => {
    const { name, limit, offset } = req.query;

    const groups = await searchGroups(name, { limit, offset });
    const response = groups.map(g => formatGroupResponse(g.group, g.memberCount));

    res.status(200).json(response);
  })
);

router.post(
  '/groups',
  validateRequest({
    body: z.object({
      name: z.string().min(1).max(30),
      clanChat: z.optional(z.string().min(1).max(12)),
      homeworld: z.optional(z.number().int().positive()),
      description: z.optional(z.string().min(1).max(100)),
      members: z.array(memberSchema)
    })
  }),
  executeRequest(async (req, res) => {
    const ipHash = getRequestIpHash(req);

    const createResult = await createGroup(req.body, ipHash);

    logger.moderation(`Created group ${createResult.group.id}`, {
      timestamp: new Date().toISOString(),
      ipHash
    });

    const details = await fetchGroupDetails(createResult.group.id);

    const response = {
      verificationCode: createResult.verificationCode,
      group: formatGroupDetailsResponse(details)
    };

    res.status(201).json(response);
  })
);

router.put(
  '/groups/:id',
  checkGroupVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      name: z.optional(z.string().min(1).max(30)),
      clanChat: z.optional(z.string().min(1).max(12)),
      homeworld: z.optional(z.number().int().positive()),
      description: z.optional(z.string().min(1).max(100)),
      bannerImage: z.optional(z.string().max(255).url()),
      profileImage: z.optional(z.string().max(255).url()),
      socialLinks: z.optional(socialLinksSchema),
      members: z.optional(z.array(memberSchema)),
      roleOrders: z.optional(z.array(groupRoleOrderSchema))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const editResult = await editGroup(id, req.body);

    logger.moderation(`Edited group ${editResult.id}`, {
      timestamp: new Date().toISOString(),
      ipHash: getRequestIpHash(req)
    });

    const details = await fetchGroupDetails(editResult.id);
    const response = formatGroupDetailsResponse(details);

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const details = await fetchGroupDetails(id);
    const response = formatGroupDetailsResponse(details);

    res.status(200).json(response);
  })
);

router.delete(
  '/groups/:id',
  checkGroupVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await deleteGroup(id);
    res.status(200).json({ message: `Successfully deleted group: ${result.name}` });
  })
);

router.post(
  '/groups/:id/members',
  checkGroupVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      members: z.array(memberSchema).nonempty()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { members } = req.body;

    const { count } = await addMembers(id, members);

    res.status(200).json({
      count,
      message: `Successfully added ${count} members.`
    });
  })
);

router.delete(
  '/groups/:id/members',
  checkGroupVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      members: z.array(z.coerce.string()).nonempty()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { members } = req.body;

    const { count } = await removeMembers(id, members);

    res.status(200).json({
      count,
      message: `Successfully removed ${count} members.`
    });
  })
);

router.put(
  '/groups/:id/role',
  checkGroupVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      username: z.string(),
      role: z.nativeEnum(GroupRole)
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;

    const result = await changeMemberRole(id, username, role);

    const response = {
      ...formatMembershipResponse(result.updatedMembership),
      player: formatPlayerResponse(result.player)
    };

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/csv',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await fetchGroupMembersCSV(id);
    res.status(200).end(result);
  })
);

router.get(
  '/groups/:id/hiscores',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: z
      .object({
        metric: z.nativeEnum(Metric)
      })
      .merge(getPaginationSchema(100_000)) // unlimited "max" limit
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { metric, limit, offset } = req.query;

    const hiscores = await fetchGroupHiscores(id, metric, { limit, offset });
    const response = hiscores.map(entry => formatGroupHiscoresEntryResponse(entry.player, entry.data));

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/activity',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: getPaginationSchema()
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { limit, offset } = req.query;

    const result = await fetchGroupActivity(id, { limit, offset });

    const response = result.map(a => ({
      ...formatMemberActivityResponse(a.activity),
      player: formatPlayerResponse(a.player)
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/statistics',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await fetchGroupStatistics(id);
    res.status(200).json(result);
  })
);

router.get(
  '/groups/:id/competitions',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await findGroupCompetitions(id);
    const response = result.map(c => formatCompetitionResponse(c.competition, c.group));

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/gained',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: z
      .object({
        metric: z.nativeEnum(Metric),
        period: z.optional(z.nativeEnum(Period).or(z.string())),
        startDate: z.optional(getDateSchema('startDate')),
        endDate: z.optional(getDateSchema('endDate'))
      })
      .merge(getPaginationSchema(100_000))
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { metric, period, startDate, endDate, limit, offset } = req.query;

    const results = await findGroupDeltas(id, metric, period, startDate, endDate, { limit, offset });

    const response = results.map(r => ({
      player: formatPlayerResponse(r.player),
      startDate: r.startDate,
      endDate: r.endDate,
      data: r.data
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/records',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: z
      .object({
        period: z.nativeEnum(Period),
        metric: z.nativeEnum(Metric)
      })
      .merge(getPaginationSchema())
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { metric, period, limit, offset } = req.query;

    const result = await findGroupRecords(id, metric, period, { limit, offset });

    const response = result.map(r => ({
      ...formatRecordResponse(r.record),
      player: formatPlayerResponse(r.player)
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/achievements',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: getPaginationSchema()
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { limit, offset } = req.query;

    const result = await findGroupAchievements(id, { limit, offset });

    const response = result.map(a => ({
      ...formatAchievementResponse(a.achievement),
      player: formatPlayerResponse(a.player)
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/groups/:id/name-changes',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: getPaginationSchema()
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { limit, offset } = req.query;

    const nameChanges = await findGroupNameChanges(id, { limit, offset });

    const response = nameChanges.map(n => ({
      ...formatNameChangeResponse(n.nameChange),
      player: formatPlayerResponse(n.player)
    }));

    res.status(200).json(response);
  })
);

router.post(
  '/groups/:id/update-all',
  checkGroupVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const outdatedCount = await updateAllMembers(id);

    res.status(200).json({
      count: outdatedCount,
      message: `${outdatedCount} outdated (updated > 24h ago) players are being updated. This can take up to a few minutes.`
    });
  })
);

router.put(
  '/groups/:id/reset-code',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await resetGroupCode(id);
    res.status(200).json(result);
  })
);

router.put(
  '/groups/:id/verify',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const { group, memberCount } = await verifyGroup(id);
    const response = formatGroupResponse(group, memberCount);

    res.status(200).json(response);
  })
);

export default router;
