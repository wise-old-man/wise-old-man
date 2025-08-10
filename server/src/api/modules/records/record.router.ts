import { Router } from 'express';
import { z } from 'zod';
import { Country, Metric, Period, PlayerBuild, PlayerType } from '../../../types';
import { formatPlayerResponse, formatRecordResponse } from '../../responses';
import { executeRequest, validateRequest } from '../../util/routing';
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

    const response = result.map(r => ({
      ...formatRecordResponse(r.record),
      player: formatPlayerResponse(r.player)
    }));

    res.status(200).json(response);
  })
);

export default router;
