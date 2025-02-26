/*
  Warnings:

  - The primary key for the `playerAnnotation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `type` on the `playerAnnotation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "player_annotation_type" AS ENUM ('opt_out', 'blocked', 'fake_f2p');

-- AlterTable
ALTER TABLE "playerAnnotation" DROP CONSTRAINT "playerAnnotation_pkey",
DROP COLUMN "type",
ADD COLUMN     "type" "player_annotation_type" NOT NULL,
ADD CONSTRAINT "playerAnnotation_pkey" PRIMARY KEY ("playerId", "type");

-- DropEnum
DROP TYPE "PlayerAnnotationType";
