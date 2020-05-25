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

// Since sequelize's param escaping doesn't work too well with strings,
// we should just inject some variables into the query directly
const GET_PERIOD_LEADERBOARD = (metricKey, typeCondition) => `
    SELECT
        player.id as "playerId",
        player.username,
        player."displayName",
        player.type,
        c."minDate" AS "startDate",
        c."maxDate" AS "endDate",
        c."endValue",
        GREATEST(i."initialValue", c."startValue") AS  "startValue" ,
        (c."endValue" - GREATEST(i."initialValue", c."startValue")) AS gained
    FROM public.players player
    JOIN (
        SELECT "playerId",
            MIN("createdAt") AS "minDate",
            MIN("${metricKey}") AS "startValue",
            MAX("createdAt") AS "maxDate",
            MAX("${metricKey}") AS "endValue"
        FROM public.snapshots
        WHERE "createdAt" >= date_trunc('second', NOW() - INTERVAL ':seconds seconds')
        GROUP BY "playerId"
    ) c ON player.id = c."playerId"
    JOIN (
        SELECT "playerId" AS "pId", MAX("${metricKey}") AS "initialValue"
        FROM "initialValues"
        GROUP BY "pId"
    ) i ON player.id = i."pId"
    WHERE ${typeCondition}
    ORDER BY gained DESC
    LIMIT 20`;

// Since sequelize's param escaping doesn't work too well with strings,
// we should just inject some variables into the query directly
const GET_COMPETITION_LEADERBOARD = (metricKey, ids) => `
    SELECT
        player.id as "playerId",
        c."minDate" AS "startDate",
        c."maxDate" AS "endDate",
        c."endValue",
        GREATEST(i."initialValue", c."startValue") AS  "startValue" ,
        (c."endValue" - GREATEST(i."initialValue", c."startValue")) AS gained
    FROM public.players player
    JOIN (
        SELECT "playerId",
            MIN("createdAt") AS "minDate",
            MIN("${metricKey}") AS "startValue",
            MAX("createdAt") AS "maxDate",
            MAX("${metricKey}") AS "endValue"
        FROM public.snapshots
        WHERE "createdAt" >= :startsAt
        AND "createdAt" <= :endsAt
        AND "playerId" IN (${ids})
        GROUP BY "playerId"
    ) c ON player.id = c."playerId"
    JOIN (
        SELECT "playerId" AS "pId", MAX("${metricKey}") AS "initialValue"
        FROM "initialValues" 
        WHERE "playerId" IN (${ids})
        GROUP BY "pId"
    ) i ON player.id = i."pId"
    WHERE "playerId" IN (${ids})
    ORDER BY gained DESC
`;

// Since sequelize's param escaping doesn't work too well with strings,
// we should just inject some variables into the query directly
const GET_GROUP_LEADERBOARD = (metricKey, ids) => `
    SELECT
        player.id as "playerId",
        player.username,
        player."displayName",
        player.type,
        c."minDate" AS "startDate",
        c."maxDate" AS "endDate",
        c."endValue",
        GREATEST(i."initialValue", c."startValue") AS  "startValue" ,
        (c."endValue" - GREATEST(i."initialValue", c."startValue")) AS gained
    FROM public.players player
    JOIN (
        SELECT "playerId",
            MIN("createdAt") AS "minDate",
            MIN("${metricKey}") AS "startValue",
            MAX("createdAt") AS "maxDate",
            MAX("${metricKey}") AS "endValue"
        FROM public.snapshots
        WHERE "createdAt" >= date_trunc('second', NOW() - INTERVAL ':seconds seconds') AND "playerId" IN (${ids})
        GROUP BY "playerId"
    ) c ON player.id = c."playerId"
    JOIN (
        SELECT "playerId" AS "pId", MAX("${metricKey}") AS "initialValue"
        FROM "initialValues" 
        WHERE "playerId" IN (${ids})
        GROUP BY "pId"
    ) i ON player.id = i."pId"
    WHERE NOT player.type = 'unknown' AND player.id IN (${ids})
    ORDER BY gained DESC
    LIMIT :limit`;

exports.GET_PLAYER_DELTA = GET_PLAYER_DELTA;
exports.GET_PERIOD_LEADERBOARD = GET_PERIOD_LEADERBOARD;
exports.GET_COMPETITION_LEADERBOARD = GET_COMPETITION_LEADERBOARD;
exports.GET_GROUP_LEADERBOARD = GET_GROUP_LEADERBOARD;
