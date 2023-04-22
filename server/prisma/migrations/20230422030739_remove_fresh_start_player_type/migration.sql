/*
  Warnings:

  - The values [fresh_start] on the enum `player_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "player_type_new" AS ENUM ('unknown', 'regular', 'ironman', 'hardcore', 'ultimate');
ALTER TABLE "players" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "players" ALTER COLUMN "type" TYPE "player_type_new" USING ("type"::text::"player_type_new");
ALTER TYPE "player_type" RENAME TO "player_type_old";
ALTER TYPE "player_type_new" RENAME TO "player_type";
DROP TYPE "player_type_old";
ALTER TABLE "players" ALTER COLUMN "type" SET DEFAULT 'unknown';
COMMIT;
