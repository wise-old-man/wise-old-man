-- AlterTable
ALTER TABLE "public"."apiKeys"
ADD COLUMN "developerDiscordId" TEXT,
ADD COLUMN "createdAt" TIMESTAMPTZ(6);

-- Existing API keys have unknown creation dates. Apply the default only to new rows.
ALTER TABLE "public"."apiKeys"
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
