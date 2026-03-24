/*
  Warnings:

  - The primary key for the `groupSocialLinks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `groupSocialLinks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."group_social_links_group_id";

-- AlterTable
ALTER TABLE "public"."groupSocialLinks" DROP CONSTRAINT "groupSocialLinks_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "groupSocialLinks_pkey" PRIMARY KEY ("groupId");
