-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "patron" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "patron" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "patrons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "discordId" TEXT,
    "groupId" INTEGER,
    "playerId" INTEGER,
    "tier" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patrons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patrons" ADD CONSTRAINT "patrons_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patrons" ADD CONSTRAINT "patrons_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
