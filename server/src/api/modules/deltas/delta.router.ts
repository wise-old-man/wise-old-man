import { Router } from 'express';
import { z } from 'zod';
import { Country, Metric, PlayerBuild, PlayerType } from '../../../utils';
import { Period } from '../../../utils/shared/period.utils';
import { executeRequest, validateRequest } from '../../util/routing';
import { findDeltaLeaderboards } from './services/FindDeltaLeaderboardsService';

const router = Router();

router.get(
  '/deltas/leaderboard',
  validateRequest({
    query: z.object({
      period: z.nativeEnum(Period),
      metric: z.nativeEnum(Metric),
      country: z.optional(z.nativeEnum(Country)),
      playerType: z.optional(z.nativeEnum(PlayerType)),
      playerBuild: z.optional(z.nativeEnum(PlayerBuild))
    })
  }),
  executeRequest(async (req, res) => {
    const { period, metric, country, playerType, playerBuild } = req.query;

    const result = await findDeltaLeaderboards(period, metric, {
      country,
      playerType,
      playerBuild
    });

    res.status(200).json(result);
  })
);

export default router;
