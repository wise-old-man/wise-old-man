-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "creatorIpHash" VARCHAR(255);

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "creatorIpHash" VARCHAR(255);

-- CreateIndex
CREATE INDEX "competitions_creator_ip_hash" ON "competitions"("creatorIpHash");

-- CreateIndex
CREATE INDEX "groups_creator_ip_hash" ON "groups"("creatorIpHash");
