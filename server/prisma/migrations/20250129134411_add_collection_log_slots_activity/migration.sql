-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'collection_logs';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "collection_logs" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "collection_logsRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "collection_logsScore" INTEGER NOT NULL DEFAULT -1;
