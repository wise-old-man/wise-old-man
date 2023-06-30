-- DropIndex
DROP INDEX "deltas_period";

-- DropIndex
DROP INDEX "deltas_playerId";

-- CreateIndex
CREATE INDEX "deltas_period_overall" ON "deltas"("period", "overall" DESC);
