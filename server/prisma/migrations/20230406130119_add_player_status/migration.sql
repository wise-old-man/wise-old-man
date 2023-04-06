-- CreateEnum
CREATE TYPE "player_status" AS ENUM ('active', 'unranked', 'flagged', 'archived');

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "status" "player_status" NOT NULL DEFAULT 'active';
