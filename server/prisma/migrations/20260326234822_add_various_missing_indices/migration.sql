/*
  Warnings:

  - The values [league_points] on the enum `metric` will be removed. If these variants are still used in the database, this will fail.

*/

-- CreateIndex
CREATE INDEX "achievements_player_id_created_at" ON "public"."achievements"("playerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "groups_patron" ON "public"."groups"("patron");

-- CreateIndex
CREATE INDEX "name_changes_created_at" ON "public"."nameChanges"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "patrons_group_id" ON "public"."patrons"("groupId");

-- CreateIndex
CREATE INDEX "patrons_player_id" ON "public"."patrons"("playerId");

-- CreateIndex
CREATE INDEX "players_status" ON "public"."players"("status");

-- CreateIndex
CREATE INDEX "players_patron" ON "public"."players"("patron");
