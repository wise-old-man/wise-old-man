import { Router } from 'express';
import { z } from 'zod';
import { Country, Metric, Period, PlayerBuild, PlayerType } from '../../../types';
import { formatPlayerResponse } from '../../responses';
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

    const results = await findDeltaLeaderboards(period, metric, {
      country,
      playerType,
      playerBuild
    });

    const response = results.map(r => ({
      player: formatPlayerResponse(r.player),
      startDate: r.startDate,
      endDate: r.endDate,
      gained: r.gained
    }));

    res.status(200).json(response);
  })
);

export default router;
