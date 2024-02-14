import { z } from 'zod';
import { Router } from 'express';
import {
  ComputedMetric,
  Country,
  EfficiencyAlgorithmType,
  Metric,
  PlayerBuild,
  PlayerType
} from '../../../utils';
import { validateRequest, executeRequest } from '../../util/routing';
import { getPaginationSchema } from '../../util/validation';
import { getRates } from './efficiency.utils';
import { findEfficiencyLeaderboards } from './services/FindEfficiencyLeaderboardsService';

const router = Router();

router.get(
  '/efficiency/leaderboard',
  validateRequest({
    query: z
      .object({
        metric: z.enum([Metric.EHP, Metric.EHB, 'ehp+ehb']),
        country: z.optional(z.nativeEnum(Country)),
        playerType: z.optional(z.nativeEnum(PlayerType)).default(PlayerType.REGULAR),
        playerBuild: z.optional(z.nativeEnum(PlayerBuild)).default(PlayerBuild.MAIN)
      })
      .merge(getPaginationSchema())
  }),
  executeRequest(async (req, res) => {
    const { metric, country, playerType, playerBuild, offset, limit } = req.query;

    const result = await findEfficiencyLeaderboards(
      metric,
      { country, playerType, playerBuild },
      { limit, offset }
    );

    res.status(200).json(result);
  })
);

router.get(
  '/efficiency/rates',
  validateRequest({
    query: z.object({
      type: z.nativeEnum(EfficiencyAlgorithmType),
      metric: z.nativeEnum(ComputedMetric)
    })
  }),
  executeRequest((req, res) => {
    const { metric, type } = req.query;

    const result = getRates(metric, type);
    res.status(200).json(result);
  })
);

export default router;
