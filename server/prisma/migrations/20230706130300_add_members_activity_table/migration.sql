-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('joined', 'left', 'changed_role');

-- CreateTable
CREATE TABLE "member_activity" (
    "groupId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "type" "activity_type" NOT NULL,
    "role" "group_role",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_activity_pkey" PRIMARY KEY ("groupId","playerId","createdAt")
);

-- CreateIndex
CREATE INDEX "member_activity_group_id_created_at" ON "member_activity"("groupId", "createdAt" DESC);
