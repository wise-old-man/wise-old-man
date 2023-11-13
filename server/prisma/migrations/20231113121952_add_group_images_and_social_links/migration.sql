-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "bannerImage" VARCHAR(255),
ADD COLUMN     "profileImage" VARCHAR(255);

-- CreateTable
CREATE TABLE "groupSocialLinks" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "discord" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "twitch" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "groupSocialLinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_social_links_group_id" ON "groupSocialLinks"("groupId");

-- AddForeignKey
ALTER TABLE "groupSocialLinks" ADD CONSTRAINT "groupSocialLinks_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
