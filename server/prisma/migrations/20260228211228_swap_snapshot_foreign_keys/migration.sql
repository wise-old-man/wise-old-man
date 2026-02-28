-- DropForeignKey
ALTER TABLE "public"."participations" DROP CONSTRAINT "participations_endSnapshotId_fkey";

-- DropForeignKey
ALTER TABLE "public"."participations" DROP CONSTRAINT "participations_startSnapshotId_fkey";

-- DropForeignKey
ALTER TABLE "public"."players" DROP CONSTRAINT "players_latestSnapshotId_fkey";

-- DropIndex
DROP INDEX "public"."participations_end_snapshot_id";

-- DropIndex
DROP INDEX "public"."participations_start_snapshot_id";

-- DropIndex
DROP INDEX "public"."players_latest_snapshot_id";

-- AddForeignKey (NOT VALID skips historical validation, see next migration for VALIDATE CONSTRAINT)
ALTER TABLE "public"."participations" ADD CONSTRAINT "participations_playerId_startSnapshotDate_fkey" FOREIGN KEY ("playerId", "startSnapshotDate") REFERENCES "public"."snapshots"("playerId", "createdAt") ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID;

-- AddForeignKey (NOT VALID skips historical validation, see next migration for VALIDATE CONSTRAINT)
ALTER TABLE "public"."participations" ADD CONSTRAINT "participations_playerId_endSnapshotDate_fkey" FOREIGN KEY ("playerId", "endSnapshotDate") REFERENCES "public"."snapshots"("playerId", "createdAt") ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID;

-- AddForeignKey (NOT VALID skips historical validation, see next migration for VALIDATE CONSTRAINT)
ALTER TABLE "public"."players" ADD CONSTRAINT "players_id_latestSnapshotDate_fkey" FOREIGN KEY ("id", "latestSnapshotDate") REFERENCES "public"."snapshots"("playerId", "createdAt") ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID;
