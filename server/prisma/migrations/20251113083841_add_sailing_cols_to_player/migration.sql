-- AlterTable
ALTER TABLE "public"."players" ADD COLUMN     "sailing" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "sailingRank" INTEGER NOT NULL DEFAULT -1;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "players_updated_at_sailing_sailing_rank" ON "public"."players"("updatedAt", "sailing", "sailingRank");
