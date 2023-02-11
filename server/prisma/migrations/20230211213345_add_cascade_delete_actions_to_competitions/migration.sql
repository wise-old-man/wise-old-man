-- DropForeignKey
ALTER TABLE "competitions" DROP CONSTRAINT "competitions_groupId_fkey";

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
