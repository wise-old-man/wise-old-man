-- AlterTable
ALTER TABLE "participations" ADD COLUMN     "endSnapshotDate" TIMESTAMP(3),
ADD COLUMN     "startSnapshotDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "latestSnapshotDate" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "participations_start_snapshot_date" ON "participations"("startSnapshotDate");

-- CreateIndex
CREATE INDEX "participations_end_snapshot_date" ON "participations"("endSnapshotDate");

-- CreateIndex
CREATE INDEX "players_latest_snapshot_date" ON "players"("latestSnapshotDate");
