-- CreateTable
CREATE TABLE "apiKeys" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "developer" TEXT NOT NULL,
    "application" TEXT NOT NULL,

    CONSTRAINT "apiKeys_pkey" PRIMARY KEY ("id")
);
