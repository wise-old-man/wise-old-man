-- CreateIndex
CREATE INDEX "memberships_group_id" ON "memberships"("groupId");

-- CreateIndex
CREATE INDEX "participations_competition_id" ON "participations"("competitionId");

-- CreateIndex
CREATE INDEX "participations_end_snapshot_id" ON "participations"("endSnapshotId");

-- CreateIndex
CREATE INDEX "participations_start_snapshot_id" ON "participations"("startSnapshotId");

-- CreateIndex
CREATE INDEX "players_latest_snapshot_id" ON "players"("latestSnapshotId");
