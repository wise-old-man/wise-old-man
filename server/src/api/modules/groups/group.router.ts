import { Router } from 'express';
import { z } from 'zod';
import { GroupRole, Metric, MigrationDataSource, Period } from '../../../utils';
import { checkAdminPermission, checkGroupVerificationCode } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import {
  getPaginationSchema,
  getDateSchema,
  memberSchema,
  socialLinksSchema,
  groupRoleOrderSchema
} from '../../util/validation';
import { findGroupCompetitions } from '../competitions/services/FindGroupCompetitionsService';
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
import { migrateGroup } from './services/MigrateGroupService';
import { removeMembers } from './services/RemoveMembersService';
import { resetGroupCode } from './services/ResetGroupCodeService';
import { searchGroups } from './services/SearchGroupsService';
import { updateAllMembers } from './services/UpdateAllMembersService';
import { verifyGroup } from './services/VerifyGroupService';
import { findGroupDeltas } from '../deltas/services/FindGroupDeltasService';
import { findGroupRecords } from '../records/services/FindGroupRecordsService';
import { findGroupAchievements } from '../achievements/services/FindGroupAchievementsService';
import { findGroupNameChanges } from '../name-changes/services/FindGroupNameChangesService';

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

    const results = await searchGroups(name, { limit, offset });
    res.status(200).json(results);
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
    const results = await createGroup(req.body);
    res.status(201).json(results);
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
      roleOrder: z.optional(z.array(groupRoleOrderSchema))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const results = await editGroup(id, req.body);
    res.status(200).json(results);
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

    const result = await fetchGroupDetails(id);
    res.status(200).json(result);
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
    res.status(200).json(result);
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

    const result = await fetchGroupHiscores(id, metric, { limit, offset });
    res.status(200).json(result);
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
    res.status(200).json(result);
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
    res.status(200).json(result);
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

    const result = await findGroupDeltas(id, metric, period, startDate, endDate, { limit, offset });
    res.status(200).json(result);
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
    res.status(200).json(result);
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
    res.status(200).json(result);
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

    const result = await findGroupNameChanges(id, { limit, offset });
    res.status(200).json(result);
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

    const result = await verifyGroup(id);
    res.status(200).json(result);
  })
);

router.get(
  '/groups/migrate/temple/:externalId',
  validateRequest({
    params: z.object({
      externalId: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { externalId } = req.params;

    const result = await migrateGroup(externalId, MigrationDataSource.TEMPLE_OSRS);
    res.status(200).json(result);
  })
);

router.get(
  '/groups/migrate/cml/:externalId',
  validateRequest({
    params: z.object({
      externalId: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { externalId } = req.params;

    const result = await migrateGroup(externalId, MigrationDataSource.CRYSTAL_MATH_LABS);
    res.status(200).json(result);
  })
);

export default router;
