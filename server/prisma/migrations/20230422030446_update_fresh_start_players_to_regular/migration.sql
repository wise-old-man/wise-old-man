-- Author: Jonxslays
-- Description: Updates all fresh start players to regular.

BEGIN;

UPDATE
    "players"
SET
    "type" = 'regular'
WHERE
    "type" = 'fresh_start';

COMMIT;
