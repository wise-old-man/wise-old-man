-- CreateTable
CREATE TABLE "playerArchives" (
    "playerId" INTEGER NOT NULL,
    "previousUsername" VARCHAR(12) NOT NULL,
    "archiveUsername" VARCHAR(12) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playerArchives_pkey" PRIMARY KEY ("playerId","createdAt")
);

-- AddForeignKey
ALTER TABLE "playerArchives" ADD CONSTRAINT "playerArchives_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
