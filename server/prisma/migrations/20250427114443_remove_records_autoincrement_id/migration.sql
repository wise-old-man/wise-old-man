/*
  Warnings:

  - The primary key for the `records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `records` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "records_player_id_period_metric";

-- AlterTable
ALTER TABLE "records" DROP CONSTRAINT "records_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "records_pkey" PRIMARY KEY ("playerId", "period", "metric");
