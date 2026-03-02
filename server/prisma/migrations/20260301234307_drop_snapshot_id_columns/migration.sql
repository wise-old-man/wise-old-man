/*
  Warnings:

  - You are about to drop the column `endSnapshotId` on the `participations` table. All the data in the column will be lost.
  - You are about to drop the column `startSnapshotId` on the `participations` table. All the data in the column will be lost.
  - You are about to drop the column `latestSnapshotId` on the `players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."participations" DROP COLUMN "endSnapshotId",
DROP COLUMN "startSnapshotId";

-- AlterTable
ALTER TABLE "public"."players" DROP COLUMN "latestSnapshotId";
