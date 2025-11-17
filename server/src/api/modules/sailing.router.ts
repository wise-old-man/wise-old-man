import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../prisma';
import { Group, Metric } from '../../types';
import { formatGroupResponse } from '../responses';
import { executeRequest, validateRequest } from '../util/routing';
const router = Router();

router.get(
  '/sailing',
  validateRequest({
    query: z.object({})
  }),
  executeRequest(async (_req, res) => {
    const [sailingDatapoints, top10Groups] = await Promise.all([
      prisma.trendDatapoint.findMany({
        where: {
          metric: Metric.SAILING,
          segmentType: null
        },
        orderBy: {
          date: 'asc'
        }
      }),
      prisma.$queryRaw<Array<Group & { count: number; avg: number; sum: number }>>`
        SELECT 
            COUNT(p."sailing") AS "count",
            AVG(p."sailing") AS "avg",
            SUM(p."sailing") AS "sum",
            g.*
        FROM public.memberships m
        JOIN public.groups g ON m."groupId" = g."id"
        JOIN public.players p ON m."playerId" = p."id"
        WHERE g."verified" = true
        AND p."updatedAt" > '2024-11-15 21:21:09.097617+00' -- Fix this
        AND p."sailing" > -1
        GROUP BY g."id", g."name"
        HAVING COUNT(p."sailing") > 100
        ORDER BY "sum" DESC
        LIMIT 10;
      `
    ]);

    const timeseries = sailingDatapoints.map(d => ({
      date: d.date,
      sum: d.sum,
      count: d.maxRank,
      sampleSize: d.segmentSize
    }));

    const groups = top10Groups.map(({ count, avg, sum, ...group }) => ({
      group: formatGroupResponse(group, -1),
      count,
      avg,
      sum
    }));

    res.status(200).json({
      count99: 0, // Make this a real thing later lmao.
      top10Groups: groups,
      timeseries
    });
  })
);

export default router;
