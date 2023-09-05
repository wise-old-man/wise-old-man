/*
  Warnings:

  - You are about to drop the column `active` on the `apiKeys` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apiKeys" DROP COLUMN "active",
ADD COLUMN     "master" BOOLEAN NOT NULL DEFAULT false;
