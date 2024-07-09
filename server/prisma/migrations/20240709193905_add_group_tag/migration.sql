-- CreateEnum
CREATE TYPE "GroupTagType" AS ENUM ('friends_chat', 'social', 'easy_going', 'events', 'pvm', 'pvp', 'skilling', 'inclusive', 'ironman', 'group_ironman', 'quests', 'minigames', 'noob_friendly', 'discord_required', 'worldwide', 'europe', 'america', 'australia');

-- CreateTable
CREATE TABLE "groupTags" (
    "groupId" INTEGER NOT NULL,
    "tag" "GroupTagType" NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "groupTags_pkey" PRIMARY KEY ("groupId","tag","index")
);

-- CreateIndex
CREATE INDEX "group_tag_group_id" ON "groupTags"("groupId");

-- AddForeignKey
ALTER TABLE "groupTags" ADD CONSTRAINT "groupTags_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
