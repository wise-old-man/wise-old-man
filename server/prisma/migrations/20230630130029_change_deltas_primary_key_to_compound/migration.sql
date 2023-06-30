/*
  Warnings:

  - The primary key for the `deltas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `deltas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "deltas" DROP CONSTRAINT "deltas_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "deltas_pkey" PRIMARY KEY ("playerId", "period");
