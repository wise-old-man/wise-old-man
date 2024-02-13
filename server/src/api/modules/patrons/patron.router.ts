import { z } from 'zod';
import { Router } from 'express';
import { executeRequest, validateRequest } from '../../util/routing';
import { claimPatreonBenefits } from './services/ClaimPatreonBenefitsService';
import { checkAdminPermission } from '../../util/middlewares';

const router = Router();

router.put(
  '/patrons/claim/:discordId',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      discordId: z.string()
    }),
    body: z.object({
      username: z.optional(z.string()),
      groupId: z.optional(z.number().int().positive())
    })
  }),
  executeRequest(async (req, res) => {
    const { discordId } = req.params;
    const { username, groupId } = req.body;

    const result = await claimPatreonBenefits(discordId, username, groupId);

    res.status(200).json(result);
  })
);

export default router;
