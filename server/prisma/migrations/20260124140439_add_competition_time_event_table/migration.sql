-- CreateEnum
CREATE TYPE "public"."competition_time_event_type" AS ENUM ('before_start', 'before_end', 'during');

-- CreateEnum
CREATE TYPE "public"."competition_time_event_status" AS ENUM ('waiting', 'executing', 'completed', 'failed', 'canceled');

-- CreateTable
CREATE TABLE "public"."competitionTimeEvents" (
    "id" SERIAL NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "type" "public"."competition_time_event_type" NOT NULL,
    "offsetMinutes" INTEGER NOT NULL,
    "executeAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "public"."competition_time_event_status" NOT NULL DEFAULT 'waiting',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "executingAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "failedAt" TIMESTAMPTZ(6),
    "canceledAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitionTimeEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "competition_time_events_competition_id_status" ON "public"."competitionTimeEvents"("competitionId", "status");

-- CreateIndex
CREATE INDEX "competition_time_events_execute_at_status" ON "public"."competitionTimeEvents"("executeAt", "status");

-- AddForeignKey
ALTER TABLE "public"."competitionTimeEvents" ADD CONSTRAINT "competitionTimeEvents_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
