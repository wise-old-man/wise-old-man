-- DropIndex
DROP INDEX "records_metric_period";

-- CreateIndex
CREATE INDEX "records_metric_period_value" ON "records"("metric", "period", "value" DESC);
