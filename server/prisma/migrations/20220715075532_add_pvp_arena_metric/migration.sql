-- AlterEnum
ALTER TYPE "enum_records_metric" ADD VALUE 'pvp_arena';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "pvp_arena" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "pvp_arenaRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "pvp_arenaScore" INTEGER NOT NULL DEFAULT -1;

-- DropEnum
DROP TYPE "enum_competitions_metric";

-- DropEnum
DROP TYPE "enum_deltas_period";
