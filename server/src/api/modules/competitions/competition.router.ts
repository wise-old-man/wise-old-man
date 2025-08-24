import { isErrored } from '@attio/fetchable';
import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import logger from '../../../services/logging.service';
import { CompetitionCSVTableType, CompetitionStatus, CompetitionType, Metric } from '../../../types';
import { assertNever } from '../../../utils/assert-never.util';
import { BadRequestError, ForbiddenError, NotFoundError, ServerError } from '../../errors';
import {
  formatCompetitionDetailsResponse,
  formatCompetitionResponse,
  formatParticipantHistoryResponse
} from '../../responses';
import { checkAdminPermission, checkCompetitionVerificationCode } from '../../util/middlewares';
import { getRequestIpHash } from '../../util/request';
import { executeRequest, validateRequest } from '../../util/routing';
import { getDateSchema, getPaginationSchema, teamSchema } from '../../util/validation';
import { addParticipants } from './services/AddParticipantsService';
import { addTeams } from './services/AddTeamsService';
import { createCompetition } from './services/CreateCompetitionService';
import { deleteCompetition } from './services/DeleteCompetitionService';
import { editCompetition } from './services/EditCompetitionService';
import { fetchCompetitionCSV } from './services/FetchCompetitionCSVService';
import { fetchCompetitionDetails } from './services/FetchCompetitionDetailsService';
import { fetchCompetitionTopHistory } from './services/FetchTopHistoryService';
import { removeParticipants } from './services/RemoveParticipantsService';
import { removeTeams } from './services/RemoveTeamsService';
import { resetCompetitionCode } from './services/ResetCompetitionCodeService';
import { searchCompetitions } from './services/SearchCompetitionsService';
import { updateAllParticipants } from './services/UpdateAllParticipantsService';

const router = Router();

router.get(
  '/competitions',
  validateRequest({
    query: z
      .object({
        title: z.optional(z.string()),
        metric: z.optional(z.nativeEnum(Metric)),
        type: z.optional(z.nativeEnum(CompetitionType)),
        status: z.optional(z.nativeEnum(CompetitionStatus))
      })
      .merge(getPaginationSchema())
  }),
  executeRequest(async (req, res) => {
    const { title, metric, type, status, limit, offset } = req.query;

    const result = await searchCompetitions(title, metric, type, status, { limit, offset });
    const response = result.map(c => formatCompetitionResponse(c.competition, c.group));

    res.status(200).json(response);
  })
);

router.post(
  '/competitions',
  (req: Request, _res: Response, next: NextFunction) => {
    // Temporary middleware to support both `metric` and `metrics` properties in the request body.
    if (req.body.metrics !== undefined) {
      return next();
    }

    if (req.body.metric === undefined) {
      return next(new BadRequestError("Parameter 'metric' is undefined."));
    }

    const parsed = z.nativeEnum(Metric).safeParse(req.body.metric);

    if (!parsed.success) {
      return next(new BadRequestError("Invalid enum value for 'metric'."));
    }

    req.body.metrics = [parsed.data];

    next();
  },
  validateRequest({
    body: z.object({
      title: z.string().min(1).max(50),
      metrics: z.array(z.nativeEnum(Metric)).min(1),
      startsAt: getDateSchema('startsAt'),
      endsAt: getDateSchema('endsAt'),
      groupId: z.optional(z.number().int().positive()),
      groupVerificationCode: z.optional(z.string()),
      participants: z.optional(z.array(z.string())),
      teams: z.optional(z.array(teamSchema))
    })
  }),
  executeRequest(async (req, res) => {
    const ipHash = getRequestIpHash(req);

    if (process.env.API_FEATURE_FLAG_MULTI_METRIC_COMPETITIONS !== 'true' && req.body.metrics.length > 1) {
      throw new BadRequestError('Creating multi-metric competitions is not enabled yet.');
    }

    const createResult = await createCompetition(req.body, ipHash);

    if (isErrored(createResult)) {
      switch (createResult.error.code) {
        case 'COMPETITION_START_DATE_AFTER_END_DATE':
          throw new BadRequestError('Start date must be before the end date.');
        case 'COMPETITION_DATES_IN_THE_PAST':
          throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
        case 'METRICS_MUST_BE_OF_SAME_TYPE':
          throw new BadRequestError('All metrics must be of the same type.');
        case 'PARTICIPANTS_AND_GROUP_MUTUALLY_EXCLUSIVE':
          throw new BadRequestError(`Properties "participants" and "groupId" are mutually exclusive.`);
        case 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE':
          throw new BadRequestError(`Properties "participants" and "teams" are mutually exclusive.`);
        case 'OPTED_OUT_PLAYERS_FOUND':
          throw new ForbiddenError(
            'One or more players have opted out of joining competitions, so they cannot be added as participants.',
            createResult.error.displayNames
          );
        case 'FAILED_TO_GENERATE_VERIFICATION_CODE':
          throw createResult.error;
        case 'FAILED_TO_CREATE_COMPETITION':
          throw new ServerError('Failed to create the competition. Please try again later.');
        case 'FAILED_TO_VALIDATE_PARTICIPANTS': {
          switch (createResult.error.subError.code) {
            case 'INVALID_USERNAMES_FOUND':
              throw new BadRequestError(
                `Found invalid usernames: Names must be 1-12 characters long, contain no special characters, and/or contain no space at the beginning or end of the name.`,
                createResult.error.subError.usernames
              );
            case 'DUPLICATE_USERNAMES_FOUND':
              throw new BadRequestError(`Found repeated usernames.`, createResult.error.subError.usernames);
            default:
              throw assertNever(createResult.error.subError);
          }
        }
        case 'FAILED_TO_VALIDATE_TEAMS': {
          switch (createResult.error.subError.code) {
            case 'INVALID_USERNAMES_FOUND':
              throw new BadRequestError(
                `Found invalid usernames: Names must be 1-12 characters long, contain no special characters, and/or contain no space at the beginning or end of the name.`,
                createResult.error.subError.usernames
              );
            case 'DUPLICATE_USERNAMES_FOUND':
              throw new BadRequestError(`Found repeated usernames.`, createResult.error.subError.usernames);
            case 'DUPLICATE_TEAM_NAMES_FOUND':
              throw new BadRequestError(`Found repeated team names.`, createResult.error.subError.teamNames);
            default:
              throw assertNever(createResult.error.subError);
          }
        }
        case 'FAILED_TO_VERIFY_GROUP_VERIFICATION_CODE': {
          switch (createResult.error.subError.code) {
            case 'GROUP_NOT_FOUND':
              throw new NotFoundError('Group not found.');
            case 'INVALID_GROUP_VERIFICATION_CODE':
              throw new BadRequestError('Invalid group verification code.');
            case 'INCORRECT_GROUP_VERIFICATION_CODE':
              throw new ForbiddenError('Incorrect group verification code.');
            default:
              throw assertNever(createResult.error.subError);
          }
        }
        default:
          assertNever(createResult.error);
      }
    }

    const { competition, verificationCode } = createResult.value;

    logger.moderation(`Created competition ${competition.id}`, {
      timestamp: new Date().toISOString(),
      ipHash
    });

    const details = await fetchCompetitionDetails(competition.id);

    const response = {
      verificationCode: verificationCode,
      competition: formatCompetitionDetailsResponse(
        details.competition,
        details.metrics,
        details.group,
        details.participations
      )
    };

    res.status(201).json(response);
  })
);

router.put(
  '/competitions/:id',
  checkCompetitionVerificationCode,
  (req: unknown, _res: Response, next: NextFunction) => {
    // Temporary middleware to support both `metric` and `metrics` properties in the request body.
    if ((req as Request).body.metric === undefined) {
      return next();
    }

    const parsed = z.nativeEnum(Metric).safeParse((req as Request).body.metric);

    if (!parsed.success) {
      return next(new BadRequestError("Invalid enum value for 'metric'."));
    }

    (req as Request).body.metrics = [parsed.data];

    next();
  },
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      title: z.optional(z.string().min(1).max(50)),
      metrics: z.optional(z.array(z.nativeEnum(Metric)).min(1)),
      startsAt: z.optional(getDateSchema('startsAt')),
      endsAt: z.optional(getDateSchema('endsAt')),
      participants: z.optional(z.array(z.string())),
      teams: z.optional(z.array(teamSchema))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    if (
      process.env.API_FEATURE_FLAG_MULTI_METRIC_COMPETITIONS !== 'true' &&
      req.body.metrics !== undefined &&
      req.body.metrics.length > 1
    ) {
      throw new BadRequestError('Creating multi-metric competitions is not enabled yet.');
    }

    const updateResult = await editCompetition(id, req.body);

    if (isErrored(updateResult)) {
      switch (updateResult.error.code) {
        case 'COMPETITION_NOT_FOUND':
          throw new NotFoundError('Competition not found.');
        case 'COMPETITION_START_DATE_AFTER_END_DATE':
          throw new BadRequestError('Start date must be before the end date.');
        case 'METRICS_MUST_BE_OF_SAME_TYPE':
          throw new BadRequestError('All metrics must be of the same type.');
        case 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE':
          throw new BadRequestError(`Properties "participants" and "teams" are mutually exclusive.`);
        case 'NOTHING_TO_UPDATE':
          throw new BadRequestError('Nothing to update.');
        case 'COMPETITION_TYPE_CANNOT_BE_CHANGED':
          throw new BadRequestError('The competition type cannot be changed.');
        case 'OPTED_OUT_PLAYERS_FOUND':
          throw new ForbiddenError(
            'One or more players have opted out of joining competitions, so they cannot be added as participants.',
            updateResult.error.displayNames
          );
        case 'FAILED_TO_UPDATE_COMPETITION':
          throw new ServerError('Failed to update the competition. Please try again later.');
        case 'FAILED_TO_VALIDATE_PARTICIPANTS': {
          switch (updateResult.error.subError.code) {
            case 'INVALID_USERNAMES_FOUND':
              throw new BadRequestError(
                `Found invalid usernames: Names must be 1-12 characters long, contain no special characters, and/or contain no space at the beginning or end of the name.`,
                updateResult.error.subError.usernames
              );
            case 'DUPLICATE_USERNAMES_FOUND':
              throw new BadRequestError(`Found repeated usernames.`, updateResult.error.subError.usernames);
            default:
              throw assertNever(updateResult.error.subError);
          }
        }
        case 'FAILED_TO_VALIDATE_TEAMS': {
          switch (updateResult.error.subError.code) {
            case 'INVALID_USERNAMES_FOUND':
              throw new BadRequestError(
                `Found invalid usernames: Names must be 1-12 characters long, contain no special characters, and/or contain no space at the beginning or end of the name.`,
                updateResult.error.subError.usernames
              );
            case 'DUPLICATE_USERNAMES_FOUND':
              throw new BadRequestError(`Found repeated usernames.`, updateResult.error.subError.usernames);
            case 'DUPLICATE_TEAM_NAMES_FOUND':
              throw new BadRequestError(`Found repeated team names.`, updateResult.error.subError.teamNames);
            default:
              throw assertNever(updateResult.error.subError);
          }
        }
        default:
          assertNever(updateResult.error);
      }
    }

    logger.moderation(`Edited competition ${updateResult.value.id}`, {
      timestamp: new Date().toISOString(),
      ipHash: getRequestIpHash(req)
    });

    const details = await fetchCompetitionDetails(updateResult.value.id);

    const response = formatCompetitionDetailsResponse(
      details.competition,
      details.metrics,
      details.group,
      details.participations
    );

    res.status(200).json(response);
  })
);

router.get(
  '/competitions/:id',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: z.object({
      metric: z.optional(z.nativeEnum(Metric))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { metric } = req.query;

    const details = await fetchCompetitionDetails(id, metric);

    const response = formatCompetitionDetailsResponse(
      details.competition,
      details.metrics,
      details.group,
      details.participations
    );

    res.status(200).json(response);
  })
);

router.get(
  '/competitions/:id/csv',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: z.object({
      metric: z.optional(z.nativeEnum(Metric)),
      teamName: z.optional(z.string()),
      table: z.optional(z.nativeEnum(CompetitionCSVTableType))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { metric, table, teamName } = req.query;

    const result = await fetchCompetitionCSV(id, metric, table, teamName);
    res.end(result);
  })
);

router.get(
  '/competitions/:id/top-history',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    query: z.object({
      metric: z.optional(z.nativeEnum(Metric))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { metric } = req.query;

    const results = await fetchCompetitionTopHistory(id, metric);
    const response = results.map(({ player, history }) => formatParticipantHistoryResponse(player, history));

    res.status(200).json(response);
  })
);

router.delete(
  '/competitions/:id',
  checkCompetitionVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await deleteCompetition(id);

    res.status(200).json({
      message: `Successfully deleted competition: ${result.title}`
    });
  })
);

router.post(
  '/competitions/:id/participants',
  checkCompetitionVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      participants: z.array(z.coerce.string()).nonempty()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { participants } = req.body;

    const { count } = await addParticipants(id, participants);

    res.status(200).json({
      count,
      message: `Successfully added ${count} participants.`
    });
  })
);

router.delete(
  '/competitions/:id/participants',
  checkCompetitionVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      participants: z.array(z.coerce.string()).nonempty()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { participants } = req.body;

    const { count } = await removeParticipants(id, participants);

    res.status(200).json({
      count,
      message: `Successfully removed ${count} participants.`
    });
  })
);

router.post(
  '/competitions/:id/teams',
  checkCompetitionVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      teams: z.array(teamSchema).nonempty()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { teams } = req.body;

    const { count } = await addTeams(id, teams);

    res.status(200).json({
      count,
      message: `Successfully added ${count} participants.`
    });
  })
);

router.delete(
  '/competitions/:id/teams',
  checkCompetitionVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      teamNames: z.array(z.coerce.string()).nonempty()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;
    const { teamNames } = req.body;

    const { count } = await removeTeams(id, teamNames);

    res.status(200).json({
      count,
      message: `Successfully removed ${count} participants.`
    });
  })
);

router.post(
  '/competitions/:id/update-all',
  checkCompetitionVerificationCode,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const { outdatedCount, cooldownDuration } = await updateAllParticipants(id);

    res.status(200).json({
      count: outdatedCount,
      message: `${outdatedCount} outdated (updated > ${cooldownDuration}h ago) players are being updated. This can take up to a few minutes.`
    });
  })
);

router.put(
  '/competitions/:id/reset-code',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await resetCompetitionCode(id);
    res.status(200).json(result);
  })
);

export default router;
