-- DropIndex
DROP INDEX "records_player_id";

-- CreateIndex
CREATE INDEX "records_player_id_period_metric" ON "records"("playerId", "period", "metric");
