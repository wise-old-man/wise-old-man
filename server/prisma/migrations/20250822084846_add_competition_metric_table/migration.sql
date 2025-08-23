-- CreateTable
CREATE TABLE "competitionMetrics" (
    "competitionId" INTEGER NOT NULL,
    "metric" "metric" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "competitionMetrics_pkey" PRIMARY KEY ("competitionId","metric")
);

-- CreateIndex
CREATE INDEX "competition_metrics_by_metric" ON "competitionMetrics"("metric");

-- AddForeignKey
ALTER TABLE "competitionMetrics" ADD CONSTRAINT "competitionMetrics_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
