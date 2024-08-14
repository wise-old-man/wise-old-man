-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;
