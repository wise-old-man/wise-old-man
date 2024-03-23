-- CreateTable
CREATE TABLE "groupRoleOrder" (
    "groupId" INTEGER NOT NULL,
    "role" "group_role" NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "groupRoleOrder_pkey" PRIMARY KEY ("groupId","role","index")
);

-- CreateIndex
CREATE INDEX "group_role_order_group_id" ON "groupRoleOrder"("groupId");

-- AddForeignKey
ALTER TABLE "groupRoleOrder" ADD CONSTRAINT "groupRoleOrder_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
