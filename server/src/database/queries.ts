export = {
  FETCH_FIRST_SNAPSHOTS_IN_PERIOD_PLAYER_IDS: (selector: string, playerIds: string, startDate: string) =>
    `SELECT s.${selector}, s."playerId", s."createdAt"
      FROM (SELECT q."playerId", MIN(q."createdAt") AS min_date
            FROM public.snapshots q
            WHERE q."playerId" IN (${playerIds}) AND q."createdAt" > '${startDate}'
            GROUP BY q."playerId"
           ) r
      JOIN public.snapshots s
          ON s."playerId" = r."playerId" AND s."createdAt" = r.min_date`,

  FETCH_LAST_SNAPSHOTS_IN_PERIOD_PLAYER_IDS: (selector: string, playerIds: string, endDate: string) =>
    `SELECT s.${selector}, s."playerId", s."createdAt"
      FROM (SELECT q."playerId", MAX(q."createdAt") AS max_date
                  FROM public.snapshots q
                  WHERE q."playerId" IN (${playerIds}) AND q."createdAt" < '${endDate}'
                  GROUP BY q."playerId"
           ) r
      JOIN public.snapshots s
      ON s."playerId" = r."playerId" AND s."createdAt" = r.max_date`
};
