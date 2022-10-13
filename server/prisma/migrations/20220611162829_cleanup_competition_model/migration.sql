/*
  Warnings:

  - The `type` column on the `competitions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `metric` on the `competitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `score` on table `competitions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('classic', 'team');

-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "metric",
ADD COLUMN     "metric" "enum_records_metric" NOT NULL,
ALTER COLUMN "score" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "CompetitionType" NOT NULL DEFAULT E'classic';

-- CreateIndex
CREATE INDEX "competitions_metric" ON "competitions"("metric");
