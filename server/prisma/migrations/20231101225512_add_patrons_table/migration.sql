-- CreateTable
CREATE TABLE "patrons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "discordId" TEXT,
    "tier" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patrons_pkey" PRIMARY KEY ("id")
);
