-- CreateEnum
CREATE TYPE "PlayerAnnotations" AS ENUM ('blacklist', 'greylist', 'fakeF2p');

-- CreateTable
CREATE TABLE "annotations" (
    "playerId" INTEGER NOT NULL,
    "type" "PlayerAnnotations" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("playerId","type")
);

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
