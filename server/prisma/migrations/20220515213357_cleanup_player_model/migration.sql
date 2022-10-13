/*
  Warnings:

  - You are about to alter the column `username` on the `players` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(12)`.
  - You are about to alter the column `displayName` on the `players` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(12)`.
  - Made the column `registeredAt` on table `players` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `players` required. This step will fail if there are existing NULL values in that column.
  - Made the column `displayName` on table `players` required. This step will fail if there are existing NULL values in that column.
  - Made the column `flagged` on table `players` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "players" ALTER COLUMN "username" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "registeredAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "displayName" SET NOT NULL,
ALTER COLUMN "displayName" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "flagged" SET NOT NULL;
