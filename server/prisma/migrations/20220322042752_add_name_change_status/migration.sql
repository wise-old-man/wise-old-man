/*
  Warnings:

  - The `status` column on the `nameChanges` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `updatedAt` on table `nameChanges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `nameChanges` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "NameChangeStatus" AS ENUM ('pending', 'denied', 'approved');

-- AlterTable
ALTER TABLE "nameChanges" DROP COLUMN "status",
ADD COLUMN     "status" "NameChangeStatus" NOT NULL DEFAULT E'pending',
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL;
