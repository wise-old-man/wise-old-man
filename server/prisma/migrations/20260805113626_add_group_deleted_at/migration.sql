-- AlterTable
ALTER TABLE "public"."groups" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "groups_deleted_at" ON "public"."groups"("deletedAt");
