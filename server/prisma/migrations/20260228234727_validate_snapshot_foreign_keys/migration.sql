-- ValidateConstraint (validates historical data added with NOT VALID in previous migration)
ALTER TABLE "public"."participations" VALIDATE CONSTRAINT "participations_playerId_startSnapshotDate_fkey";

-- ValidateConstraint (validates historical data added with NOT VALID in previous migration)
ALTER TABLE "public"."participations" VALIDATE CONSTRAINT "participations_playerId_endSnapshotDate_fkey";

-- ValidateConstraint (validates historical data added with NOT VALID in previous migration)
ALTER TABLE "public"."players" VALIDATE CONSTRAINT "players_id_latestSnapshotDate_fkey";
