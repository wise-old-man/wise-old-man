/*
  Warnings:

  - You are about to drop the `deltas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "deltas" DROP CONSTRAINT "deltas_playerId_fkey";

-- DropTable
DROP TABLE "deltas";
