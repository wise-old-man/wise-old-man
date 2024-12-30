/*
  Warnings:

  - You are about to drop the `annotations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PlayerAnnotationType" AS ENUM ('blacklist', 'greylist', 'fake_f2p');

-- DropForeignKey
ALTER TABLE "annotations" DROP CONSTRAINT "annotations_playerId_fkey";

-- DropTable
DROP TABLE "annotations";

-- DropEnum
DROP TYPE "PlayerAnnotations";

-- CreateTable
CREATE TABLE "playerAnnotation" (
    "playerId" INTEGER NOT NULL,
    "type" "PlayerAnnotationType" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playerAnnotation_pkey" PRIMARY KEY ("playerId","type")
);

-- AddForeignKey
ALTER TABLE "playerAnnotation" ADD CONSTRAINT "playerAnnotation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
