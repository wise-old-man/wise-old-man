-- CreateTable
CREATE TABLE "cachedDeltas" (
    "playerId" INTEGER NOT NULL,
    "period" "period" NOT NULL,
    "metric" "metric" NOT NULL,
    "value" INTEGER NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL,
    "endedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cachedDeltas_pkey" PRIMARY KEY ("playerId","period","metric")
);

-- CreateIndex
CREATE INDEX "cached_deltas_period_metric_value" ON "cachedDeltas"("period", "metric", "value" DESC);

-- AddForeignKey
ALTER TABLE "cachedDeltas" ADD CONSTRAINT "cachedDeltas_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
