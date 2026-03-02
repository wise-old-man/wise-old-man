-- AlterTable: drop the unique constraint on id (which owns the underlying index)
ALTER TABLE "public"."snapshots" DROP CONSTRAINT "snapshots_id_unique";

-- AlterTable: drop the id column itself
ALTER TABLE "public"."snapshots" DROP COLUMN "id";

-- Drop the auto-increment sequence that backed id
DROP SEQUENCE IF EXISTS "public"."snapshots_id_seq";
