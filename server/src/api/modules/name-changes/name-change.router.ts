import { isErrored } from '@attio/fetchable';
import { Router } from 'express';
import { z } from 'zod';
import logger from '../../../services/logging.service';
import { NameChangeStatus } from '../../../types';
import { NotFoundError, ServerError } from '../../errors';
import { formatNameChangeResponse } from '../../responses';
import { checkAdminPermission } from '../../util/middlewares';
import { getRequestIpHash } from '../../util/request';
import { executeRequest, validateRequest } from '../../util/routing';
import { getPaginationSchema } from '../../util/validation';
import { approveNameChange } from './services/ApproveNameChangeService';
import { bulkSubmitNameChanges } from './services/BulkSubmitNameChangesService';
import { clearNameChangeHistory } from './services/ClearNameChangeHistoryService';
import { denyNameChange } from './services/DenyNameChangeService';
import { fetchNameChangeDetails } from './services/FetchNameChangeDetailsService';
import { searchNameChanges } from './services/SearchNameChangesService';
import { submitNameChange } from './services/SubmitNameChangeService';

const router = Router();

router.get(
  '/names',
  validateRequest({
    query: z
      .object({
        username: z.optional(z.string()),
        status: z.optional(z.nativeEnum(NameChangeStatus))
      })
      .merge(getPaginationSchema())
  }),
  executeRequest(async (req, res) => {
    const { username, status, limit, offset } = req.query;

    const nameChanges = await searchNameChanges(username, status, { limit, offset });
    const response = nameChanges.map(formatNameChangeResponse);

    res.status(200).json(response);
  })
);

router.post(
  '/names',
  validateRequest({
    body: z.object({
      oldName: z.string(),
      newName: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { oldName, newName } = req.body;

    const result = await submitNameChange(oldName, newName);

    logger.moderation(`Submitted name change ${result.oldName} -> ${result.newName}`, {
      timestamp: new Date().toISOString(),
      ipHash: getRequestIpHash(req)
    });

    const response = formatNameChangeResponse(result);

    res.status(201).json(response);
  })
);

router.post(
  '/names/bulk',
  validateRequest({
    body: z
      .array(
        z.object(
          { oldName: z.string(), newName: z.string() },
          { invalid_type_error: 'All name change objects must have "oldName" and "newName" properties.' }
        ),
        { invalid_type_error: 'Invalid name change list format.' }
      )
      .nonempty('Empty name change list.')
  }),
  executeRequest(async (req, res) => {
    const entries = req.body as Array<{ oldName: string; newName: string }>;

    const result = await bulkSubmitNameChanges(entries);
    res.status(201).json(result);
  })
);

router.get(
  '/names/:id',
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await fetchNameChangeDetails(id);

    if (isErrored(result)) {
      switch (result.error.code) {
        case 'FAILED_TO_LOAD_HISCORES':
          throw new ServerError('Failed to load the hiscores.');
        case 'OLD_STATS_NOT_FOUND':
          throw new ServerError('Old stats for this name change could not be found.');
        case 'NAME_CHANGE_NOT_FOUND':
          throw new NotFoundError('Name change id was not found.');
      }
    }

    res.status(200).json(result.value);
  })
);

router.post(
  '/names/:id/approve',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await approveNameChange(id);
    const response = formatNameChangeResponse(result);

    res.status(200).json(response);
  })
);

router.post(
  '/names/:id/deny',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      id: z.coerce.number().int().positive()
    })
  }),
  executeRequest(async (req, res) => {
    const { id } = req.params;

    const result = await denyNameChange(id, { reason: 'manual_review' });
    const response = formatNameChangeResponse(result);

    res.status(200).json(response);
  })
);

router.post(
  '/names/:username/clear-history',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;

    const { count } = await clearNameChangeHistory(username);

    res.status(200).json({
      count,
      message: `Successfully deleted ${count} name changes.`
    });
  })
);

export default router;
