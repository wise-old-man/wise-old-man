-- AlterTable
ALTER TABLE "players" ADD COLUMN     "latestSnapshotId" INTEGER;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_latestSnapshotId_fkey" FOREIGN KEY ("latestSnapshotId") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
