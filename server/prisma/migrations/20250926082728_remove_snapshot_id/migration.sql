/*
  Warnings:

  - You are about to drop the column `endSnapshotId` on the `participations` table. All the data in the column will be lost.
  - You are about to drop the column `startSnapshotId` on the `participations` table. All the data in the column will be lost.
  - You are about to drop the column `latestSnapshotId` on the `players` table. All the data in the column will be lost.
  - The primary key for the `snapshots` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `snapshots` table. All the data in the column will be lost.

*/
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

-- AlterTable
ALTER TABLE "public"."participations" DROP COLUMN "endSnapshotId",
DROP COLUMN "startSnapshotId";

-- AlterTable
ALTER TABLE "public"."players" DROP COLUMN "latestSnapshotId";

-- AlterTable
ALTER TABLE "public"."snapshots" DROP CONSTRAINT "snapshots_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "snapshots_pkey" PRIMARY KEY ("playerId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."participations" ADD CONSTRAINT "participations_playerId_startSnapshotDate_fkey" FOREIGN KEY ("playerId", "startSnapshotDate") REFERENCES "public"."snapshots"("playerId", "createdAt") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."participations" ADD CONSTRAINT "participations_playerId_endSnapshotDate_fkey" FOREIGN KEY ("playerId", "endSnapshotDate") REFERENCES "public"."snapshots"("playerId", "createdAt") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."players" ADD CONSTRAINT "players_id_latestSnapshotDate_fkey" FOREIGN KEY ("id", "latestSnapshotDate") REFERENCES "public"."snapshots"("playerId", "createdAt") ON DELETE NO ACTION ON UPDATE NO ACTION;
