import { Router } from 'express';
import { z } from 'zod';
import logger from '../../../services/logging.service';
import { CompetitionCSVTableType, CompetitionStatus, CompetitionType, Metric } from '../../../types';
import {
  formatCompetitionDetailsResponse,
  formatCompetitionResponse,
  formatCompetitionTop5ProgressResponse
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
import { fetchCompetitionTop5Progress } from './services/FetchTop5ProgressService';
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

    const competitions = await searchCompetitions(title, metric, type, status, { limit, offset });

    const response = competitions.map(competition =>
      formatCompetitionResponse(competition, competition.participantCount, competition.group)
    );

    res.status(200).json(response);
  })
);

router.post(
  '/competitions',
  validateRequest({
    body: z.object({
      title: z.string().min(1).max(50),
      metric: z.nativeEnum(Metric),
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

    const createResult = await createCompetition(req.body, ipHash);

    logger.moderation(`Created competition ${createResult.competition.id}`, {
      timestamp: new Date().toISOString(),
      ipHash
    });

    const details = await fetchCompetitionDetails(createResult.competition.id);

    const response = {
      verificationCode: createResult.verificationCode,
      competition: formatCompetitionDetailsResponse(
        details.competition,
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
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    }),
    body: z.object({
      title: z.optional(z.string().min(1).max(50)),
      metric: z.optional(z.nativeEnum(Metric)),
      startsAt: z.optional(getDateSchema('startsAt')),
      endsAt: z.optional(getDateSchema('endsAt')),
      participants: z.optional(z.array(z.string())),
      teams: z.optional(z.array(teamSchema))
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const updatedCompetition = await editCompetition(id, req.body);

    logger.moderation(`Edited competition ${updatedCompetition.id}`, {
      timestamp: new Date().toISOString(),
      ipHash: getRequestIpHash(req)
    });

    const details = await fetchCompetitionDetails(updatedCompetition.id);

    const response = formatCompetitionDetailsResponse(
      details.competition,
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

    const results = await fetchCompetitionTop5Progress(id, metric);

    const response = results.map(({ player, history }) =>
      formatCompetitionTop5ProgressResponse(player, history)
    );

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
