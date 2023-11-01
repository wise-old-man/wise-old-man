-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "patron" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "patron" BOOLEAN NOT NULL DEFAULT false;
