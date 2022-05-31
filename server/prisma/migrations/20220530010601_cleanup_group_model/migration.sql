/*
  Warnings:

  - You are about to alter the column `clanChat` on the `groups` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(12)`.
  - Made the column `createdAt` on table `groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `score` on table `groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verified` on table `groups` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "clanChat" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "verified" SET NOT NULL;
