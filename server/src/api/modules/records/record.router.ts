import { z } from 'zod';
import { Router } from 'express';
import { Country, Metric, Period, PlayerBuild, PlayerType } from '../../../utils';
import { validateRequest, executeRequest } from '../../util/routing';
import { findRecordLeaderboards } from './services/FindRecordLeaderboardsService';

const router = Router();

router.get(
  '/records/leaderboard',
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

    const result = await findRecordLeaderboards(period, metric, {
      country,
      playerType,
      playerBuild
    });

    res.status(200).json(result);
  })
);

export default router;
