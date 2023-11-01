-- AlterTable
ALTER TABLE "patrons" ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "playerId" INTEGER;

-- AddForeignKey
ALTER TABLE "patrons" ADD CONSTRAINT "patrons_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patrons" ADD CONSTRAINT "patrons_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
