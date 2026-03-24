-- AlterTable
ALTER TABLE "public"."trendDatapoints" ADD COLUMN     "segmentType" TEXT,
ADD COLUMN     "segmentValue" TEXT;

-- CreateIndex
CREATE INDEX "trend_datapoints_metric_segment_type_segment_value_date" ON "public"."trendDatapoints"("metric", "segmentType", "segmentValue", "date" DESC);
