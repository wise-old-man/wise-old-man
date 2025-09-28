import { isErrored } from '@attio/fetchable';
import { Router } from 'express';
import { z } from 'zod';
import { JobType, jobManager } from '../../../jobs';
import prisma from '../../../prisma';
import { CompetitionStatus, Metric, Period, PlayerAnnotationType } from '../../../types';
import { assertNever } from '../../../utils/assert-never.util';
import { BadRequestError, ForbiddenError, NotFoundError, RateLimitError, ServerError } from '../../errors';
import {
  formatAchievementProgressResponse,
  formatAchievementResponse,
  formatCompetitionResponse,
  formatGroupResponse,
  formatMembershipResponse,
  formatNameChangeResponse,
  formatParticipationResponse,
  formatPlayerAnnotationResponse,
  formatPlayerArchiveResponse,
  formatPlayerCompetitionStandingResponse,
  formatPlayerDetailsResponse,
  formatPlayerResponse,
  formatRecordResponse,
  formatSnapshotResponse
} from '../../responses';
import { checkAdminPermission, detectRuneLiteNameChange } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import { getDateSchema, getPaginationSchema } from '../../util/validation';
import { findPlayerAchievementProgress } from '../achievements/services/FindPlayerAchievementProgressService';
import { findPlayerAchievements } from '../achievements/services/FindPlayerAchievementsService';
import { findPlayerParticipations } from '../competitions/services/FindPlayerParticipationsService';
import { findPlayerParticipationsStandings } from '../competitions/services/FindPlayerParticipationsStandingsService';
import { findPlayerDeltas } from '../deltas/services/FindPlayerDeltasService';
import { getPlayerEfficiencyMap } from '../efficiency/efficiency.utils';
import { findPlayerMemberships } from '../groups/services/FindPlayerMembershipsService';
import { findPlayerNameChanges } from '../name-changes/services/FindPlayerNameChangesService';
import { findPlayerRecords } from '../records/services/FindPlayerRecordsService';
import { findPlayerSnapshotTimeline } from '../snapshots/services/FindPlayerSnapshotTimelineService';
import { findPlayerSnapshots } from '../snapshots/services/FindPlayerSnapshotsService';
import { rollbackCollectionLog } from '../snapshots/services/RollbackCollectionLogService';
import { rollbackSnapshots } from '../snapshots/services/RollbackSnapshotsService';
import { standardize } from './player.utils';
import { archivePlayer } from './services/ArchivePlayerService';
import { assertPlayerType } from './services/AssertPlayerTypeService';
import { changePlayerCountry } from './services/ChangePlayerCountryService';
import { createPlayerAnnotation } from './services/CreateAnnotationService';
import { deletePlayerAnnotation } from './services/DeleteAnnotationService';
import { deletePlayer } from './services/DeletePlayerService';
import { fetchPlayerDetails } from './services/FetchPlayerDetailsService';
import { findPlayerArchives } from './services/FindPlayerArchivesService';
import { searchPlayers } from './services/SearchPlayersService';
import { updatePlayer } from './services/UpdatePlayerService';

const router = Router();

router.get(
  '/players/search',
  validateRequest({
    query: z
      .object({
        username: z.string().min(1)
      })
      .merge(getPaginationSchema())
  }),
  executeRequest(async (req, res) => {
    const { username, limit, offset } = req.query;

    const players = await searchPlayers(username, { limit, offset });
    const response = players.map(formatPlayerResponse);

    res.status(200).json(response);
  })
);

router.post(
  '/players/:username',
  detectRuneLiteNameChange,
  (req, res, next) => {
    if (req.body.force) return checkAdminPermission(req, res, next);
    next();
  },
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    body: z.object({
      force: z.optional(z.boolean())
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { force } = req.body;

    const updateResult = await updatePlayer(username, force);

    if (isErrored(updateResult)) {
      switch (updateResult.error.code) {
        case 'HISCORES_USERNAME_NOT_FOUND':
          throw new BadRequestError('Failed to load hiscores: Player not found.');
        case 'HISCORES_SERVICE_UNAVAILABLE':
          throw new ServerError('Failed to load hiscores: Jagex service is unavailable');
        case 'HISCORES_UNEXPECTED_ERROR':
          throw new ServerError('Failed to load hiscores: Connection refused.');
        case 'PLAYER_IS_ARCHIVED':
          throw new BadRequestError('Failed to update: Player is archived.');
        case 'PLAYER_IS_RATE_LIMITED':
          throw new RateLimitError(`Error: ${username} has been updated recently.`);
        case 'PLAYER_IS_BLOCKED':
          throw new ForbiddenError(
            'Failed to update: This player has been blocked, please contact us on Discord for more information.'
          );
        case 'PLAYER_OPTED_OUT':
          throw new ForbiddenError(
            'Failed to update: Player has opted out of tracking. If this is your account and you want to opt back in, contact us on Discord.'
          );
        case 'PLAYER_IS_FLAGGED':
          throw new ServerError('Failed to update: Player is flagged.');
        case 'USERNAME_VALIDATION_ERROR':
          throw new BadRequestError(`Validation error: ${updateResult.error.subError.code}`);
        default:
          assertNever(updateResult.error);
      }
    }

    const details = await fetchPlayerDetails(username);
    const response = formatPlayerDetailsResponse(details);

    res.status(updateResult.value.isNew ? 201 : 200).json(response);
  })
);

router.get(
  '/players/:username',
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const details = await fetchPlayerDetails(username);
    const response = formatPlayerDetailsResponse(details);

    res.status(200).json(response);
  })
);

router.get(
  '/players/id/:id',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    // Find the username for this player ID.
    const query = await prisma.player.findFirst({
      where: { id },
      select: { username: true }
    });

    if (!query) {
      throw new NotFoundError('Player not found.');
    }

    const details = await fetchPlayerDetails(query.username);
    const response = formatPlayerDetailsResponse(details);

    res.status(200).json(response);
  })
);

router.post(
  '/players/:username/assert-type',
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (player === null) {
      throw new NotFoundError('Player not found.');
    }

    const assertionResult = await assertPlayerType(player);

    if (isErrored(assertionResult)) {
      throw new ServerError('Failed to assert player type.');
    }

    const response = {
      changed: assertionResult.value.changed,
      player: formatPlayerResponse(
        assertionResult.value.changed ? assertionResult.value.updatedPlayer : player
      )
    };

    res.status(200).json(response);
  })
);

router.put(
  '/players/:username/country',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    body: z.object({
      country: z.string().min(2).or(z.null())
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { country } = req.body;

    const result = await changePlayerCountry(username, country);
    const response = formatPlayerResponse(result);

    res.status(200).json(response);
  })
);

router.post(
  '/players/:username/rollback',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    body: z.object({
      untilLastChange: z.optional(z.boolean())
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { untilLastChange } = req.body;

    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    const rollbackResult = await rollbackSnapshots(
      player.id,
      untilLastChange && player.lastChangedAt ? new Date(player.lastChangedAt.getTime() + 1000) : undefined
    );

    if (isErrored(rollbackResult)) {
      switch (rollbackResult.error.code) {
        case 'FAILED_TO_ROLLBACK_SNAPSHOTS':
          throw new ServerError('Failed to rollback player snapshots.');
        case 'NO_SNAPSHOTS_DELETED':
          throw new BadRequestError('No snapshots were deleted, rollback not performed.');
        default:
          assertNever(rollbackResult.error);
      }
    }

    const updateResult = await updatePlayer(username);

    if (isErrored(updateResult)) {
      throw new ServerError('Failed to update player after rollback.');
    }

    jobManager.add(JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW, {}, { delay: 5_000 });

    res.status(200).json({
      message: `Successfully rolled back player: ${updateResult.value.player.displayName}`
    });
  })
);

router.post(
  '/players/:username/rollback-col-log',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (player === null) {
      throw new NotFoundError('Player not found.');
    }

    const rollbackResult = await rollbackCollectionLog(player.id, username);

    if (isErrored(rollbackResult)) {
      throw new ServerError('Failed to rollback collection log data from snapshots.');
    }

    const updateResult = await updatePlayer(username);

    if (isErrored(updateResult)) {
      throw new ServerError('Failed to update player after rollback.');
    }

    jobManager.add(JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW, {}, { delay: 5_000 });

    res.status(200).json({
      message: `Successfully rolled back collection logs for player: ${updateResult.value.player.displayName}`
    });
  })
);

router.post(
  '/players/:username/archive',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    const { archivedPlayer } = await archivePlayer(player);

    try {
      await updatePlayer(username);
    } catch (_e) {
      throw new ServerError('Failed to update new player post-archive.');
    }

    jobManager.add(JobType.SCHEDULE_FLAGGED_PLAYER_REVIEW, {}, { delay: 5_000 });

    const response = formatPlayerResponse(archivedPlayer);

    res.status(200).json(response);
  })
);

router.delete(
  '/players/:username',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const result = await deletePlayer(username);

    res.status(200).json({
      message: `Successfully deleted player: ${result.displayName}`
    });
  })
);

router.get(
  '/players/:username/snapshots',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: z
      .object({
        period: z.optional(z.nativeEnum(Period).or(z.string())),
        startDate: z.optional(getDateSchema('startDate')),
        endDate: z.optional(getDateSchema('endDate'))
      })
      .merge(getPaginationSchema(200))
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { period, startDate, endDate, ...pagination } = req.query;

    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    const snapshots = await findPlayerSnapshots(player.id, period, startDate, endDate, pagination);

    const response = snapshots.map(snapshot =>
      formatSnapshotResponse(snapshot, getPlayerEfficiencyMap(snapshot, player))
    );

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/snapshots/timeline',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: z.object({
      metric: z.nativeEnum(Metric),
      period: z.optional(z.nativeEnum(Period).or(z.string())),
      startDate: z.optional(getDateSchema('startDate')),
      endDate: z.optional(getDateSchema('endDate'))
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { metric, period, startDate, endDate } = req.query;

    const results = await findPlayerSnapshotTimeline(username, metric, period, startDate, endDate);
    res.status(200).json(results);
  })
);

router.get(
  '/players/:username/archives',
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const result = await findPlayerArchives(username);

    const response = result.map(a => ({
      ...formatPlayerArchiveResponse(a.archive),
      player: formatPlayerResponse(a.player)
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/groups',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: getPaginationSchema()
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { limit, offset } = req.query;

    const memberships = await findPlayerMemberships(username, { limit, offset });

    const response = memberships.map(m => ({
      ...formatMembershipResponse(m.membership),
      group: formatGroupResponse(m.group, m.group.memberCount)
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/competitions',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: z.object({
      status: z.optional(z.nativeEnum(CompetitionStatus))
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { status } = req.query;

    const participations = await findPlayerParticipations(username, status);

    const response = participations.map(p => ({
      ...formatParticipationResponse(p.participation),
      competition: formatCompetitionResponse(p.competition, p.group)
    }));

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/competitions/standings',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: z.object({
      status: z.enum([CompetitionStatus.ONGOING, CompetitionStatus.FINISHED])
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { status } = req.query;

    const standings = await findPlayerParticipationsStandings(username, status);

    const response = standings.map(s =>
      formatPlayerCompetitionStandingResponse(
        s.participation,
        s.competition,
        s.group,
        s.progress,
        s.levels,
        s.rank
      )
    );

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/names',
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const nameChanges = await findPlayerNameChanges(username);
    const response = nameChanges.map(formatNameChangeResponse);

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/gained',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: z.object({
      period: z.optional(z.nativeEnum(Period).or(z.string())),
      startDate: z.optional(getDateSchema('startDate')),
      endDate: z.optional(getDateSchema('endDate'))
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { period, startDate, endDate } = req.query;

    const results = await findPlayerDeltas(username, period, startDate, endDate);
    res.status(200).json(results);
  })
);

router.get(
  '/players/:username/records',
  validateRequest({
    params: z.object({
      username: z.string()
    }),
    query: z.object({
      metric: z.optional(z.nativeEnum(Metric)),
      period: z.optional(z.nativeEnum(Period))
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { metric, period } = req.query;

    const records = await findPlayerRecords(username, period, metric);
    const response = records.map(formatRecordResponse);

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/achievements',
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const achievements = await findPlayerAchievements(username);
    const response = achievements.map(formatAchievementResponse);

    res.status(200).json(response);
  })
);

router.get(
  '/players/:username/achievements/progress',
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const achievements = await findPlayerAchievementProgress(username);
    const response = achievements.map(formatAchievementProgressResponse);

    res.status(200).json(response);
  })
);

router.post(
  '/players/:username/annotation',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string().min(1)
    }),
    body: z.object({
      annotationType: z.nativeEnum(PlayerAnnotationType)
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { annotationType } = req.body;

    const createdAnnotation = await createPlayerAnnotation(username, annotationType);
    const response = formatPlayerAnnotationResponse(createdAnnotation);

    res.status(201).json(response);
  })
);

router.delete(
  '/players/:username/annotation',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string().min(1)
    }),
    body: z.object({
      annotationType: z.nativeEnum(PlayerAnnotationType)
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { annotationType } = req.body;

    const deletedAnnotation = await deletePlayerAnnotation(username, annotationType);

    res.status(200).json(`Annotation ${deletedAnnotation.type} deleted for player ${username}`);
  })
);

export default router;
