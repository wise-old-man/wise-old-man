/*
  Warnings:

  - You are about to drop the column `metric` on the `competitions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "competitions_metric";

-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "metric";
