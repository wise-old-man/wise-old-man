-- DropIndex
DROP INDEX "players_type";

-- CreateIndex
CREATE INDEX "players_type_ehp" ON "players"("type", "ehp" DESC);

-- CreateIndex
CREATE INDEX "players_type_ehb" ON "players"("type", "ehb" DESC);
