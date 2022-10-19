-- DropIndex
DROP INDEX "achievements_player_id";

-- DropIndex
DROP INDEX "achievements_player_id_type";

-- DropIndex
DROP INDEX "competitions_id";

-- DropIndex
DROP INDEX "competitions_title";

-- DropIndex
DROP INDEX "deltas_id";

-- DropIndex
DROP INDEX "groups_id";

-- DropIndex
DROP INDEX "memberships_player_id_group_id";

-- DropIndex
DROP INDEX "name_changes_id";

-- DropIndex
DROP INDEX "participations_player_id_competition_id";

-- DropIndex
DROP INDEX "players_id";

-- DropIndex
DROP INDEX "records_id";

-- DropIndex
DROP INDEX "records_metric";

-- DropIndex
DROP INDEX "records_period";

-- DropIndex
DROP INDEX "snapshots_created_at";

-- DropIndex
DROP INDEX "snapshots_id";

-- DropIndex
DROP INDEX "snapshots_player_id";

-- CreateIndex
CREATE INDEX "competitions_group_id" ON "competitions"("groupId");

-- CreateIndex
CREATE INDEX "name_changes_status" ON "nameChanges"("status");

-- CreateIndex
CREATE INDEX "players_build" ON "players"("build");

-- CreateIndex
CREATE INDEX "players_country" ON "players"("country");

-- CreateIndex
CREATE INDEX "records_metric_period" ON "records"("metric", "period");

-- CreateIndex
CREATE INDEX "snapshots_player_id_created_at" ON "snapshots"("playerId", "createdAt" DESC);

-- RenameIndex
ALTER INDEX "groups_name" RENAME TO "groups_name_key";

-- RenameIndex
ALTER INDEX "players_username" RENAME TO "players_username_key";
