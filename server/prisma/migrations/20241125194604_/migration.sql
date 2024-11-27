/*
  Warnings:

  - The values [fakeF2p] on the enum `PlayerAnnotations` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlayerAnnotations_new" AS ENUM ('blacklist', 'greylist', 'fake_f2p');
ALTER TABLE "annotations" ALTER COLUMN "type" TYPE "PlayerAnnotations_new" USING ("type"::text::"PlayerAnnotations_new");
ALTER TYPE "PlayerAnnotations" RENAME TO "PlayerAnnotations_old";
ALTER TYPE "PlayerAnnotations_new" RENAME TO "PlayerAnnotations";
DROP TYPE "PlayerAnnotations_old";
COMMIT;
