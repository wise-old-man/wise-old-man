/*
  Warnings:

  - You are about to drop the column `sailing` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `sailingRank` on the `players` table. All the data in the column will be lost.

*/

-- DropIndex
DROP INDEX "public"."players_updated_at_sailing_sailing_rank";

-- AlterTable
ALTER TABLE "public"."players" DROP COLUMN "sailing",
DROP COLUMN "sailingRank";
