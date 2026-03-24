/*
  Warnings:

  - A unique constraint covering the columns `[playerId,createdAt]` on the table `snapshots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "snapshots_player_id_created_at_unique_idx" ON "public"."snapshots"("playerId", "createdAt");
