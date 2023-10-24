-- AddForeignKey
ALTER TABLE "member_activity" ADD CONSTRAINT "member_activity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "member_activity" ADD CONSTRAINT "member_activity_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
