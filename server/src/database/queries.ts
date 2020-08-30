const GET_PLAYER_DELTA = `
    WITH differences AS (
    SELECT
        *,
        ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS first_row,
        ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) AS last_row
    FROM public.snapshots
    WHERE "createdAt" >= date_trunc('second', NOW() - INTERVAL ':seconds seconds') AND "playerId" = :playerId
    ORDER BY "createdAt")

    SELECT * FROM differences WHERE differences.first_row = 1 OR differences.last_row = 1`;

export { GET_PLAYER_DELTA };
