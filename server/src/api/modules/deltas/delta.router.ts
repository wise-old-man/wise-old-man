import { z } from 'zod';
import { Router } from 'express';
import { Country, Metric, Period, PlayerBuild } from '../../../utils';
import { validateRequest, executeRequest } from '../../util/routing';
import { findDeltaLeaderboards } from './services/FindDeltaLeaderboardsService';

const router = Router();

router.get(
  '/deltas/leaderboard',
  validateRequest({
    query: z.object({
      period: z.nativeEnum(Period),
      metric: z.nativeEnum(Metric),
      country: z.optional(z.nativeEnum(Country)),
      playerBuild: z.optional(z.nativeEnum(PlayerBuild))
    })
  }),
  executeRequest(async (req, res) => {
    const { period, metric, country, playerBuild } = req.query;

    const result = await findDeltaLeaderboards(period, metric, {
      country,
      playerBuild
    });

    res.status(200).json(result);
  })
);

export default router;
