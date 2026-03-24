-- PK swap: reuses pre-built indexes where possible, all ALTER TABLE ops are instant metadata changes.

-- Build unique index on id if it doesn't already exist
CREATE UNIQUE INDEX IF NOT EXISTS "snapshots_id_unique" ON "snapshots" ("id");

-- Drop FK constraints that depend on snapshots_pkey so we can swap the PK
-- They will be re-added below pointing at the new snapshots_id_unique constraint
ALTER TABLE "participations" DROP CONSTRAINT "participations_startSnapshotId_fkey";
ALTER TABLE "participations" DROP CONSTRAINT "participations_endSnapshotId_fkey";
ALTER TABLE "players" DROP CONSTRAINT "players_latestSnapshotId_fkey";

-- Drop the old auto-increment PK
ALTER TABLE "snapshots" DROP CONSTRAINT "snapshots_pkey";

-- Promote the existing unique index on (playerId, createdAt) to be the new PK
-- USING INDEX makes this instant — no table scan or index rebuild
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_pkey" PRIMARY KEY
  USING INDEX "snapshots_player_id_created_at_unique_idx";

-- Attach the unique index on id as a named constraint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_id_unique" UNIQUE
  USING INDEX "snapshots_id_unique";

-- Re-add the FK constraints — they now reference snapshots.id via snapshots_id_unique
ALTER TABLE "participations" ADD CONSTRAINT "participations_startSnapshotId_fkey"
  FOREIGN KEY ("startSnapshotId") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "participations" ADD CONSTRAINT "participations_endSnapshotId_fkey"
  FOREIGN KEY ("endSnapshotId") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "players" ADD CONSTRAINT "players_latestSnapshotId_fkey"
  FOREIGN KEY ("latestSnapshotId") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- Drop the now-redundant non-unique index (PK covers the same columns)
DROP INDEX IF EXISTS "snapshots_player_id_created_at";
