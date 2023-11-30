-- CreateTable
CREATE TABLE "trendDatapoints" (
    "date" TIMESTAMP(3) NOT NULL,
    "metric" "metric" NOT NULL,
    "sum" BIGINT NOT NULL,
    "maxValue" BIGINT NOT NULL,
    "minValue" INTEGER NOT NULL,
    "maxRank" INTEGER NOT NULL,

    CONSTRAINT "trendDatapoints_pkey" PRIMARY KEY ("metric","date")
);
