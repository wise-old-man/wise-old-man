/*
  Warnings:

  - The `build` column on the `players` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `type` on table `players` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PlayerBuild" AS ENUM ('main', 'f2p', 'lvl3', 'zerker', 'def1', 'hp10');

-- AlterTable
ALTER TABLE "players" ALTER COLUMN "type" SET NOT NULL,
DROP COLUMN "build",
ADD COLUMN     "build" "PlayerBuild" NOT NULL DEFAULT E'main';
