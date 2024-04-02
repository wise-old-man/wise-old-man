-- CreateTable
CREATE TABLE "groupRoleOrders" (
    "groupId" INTEGER NOT NULL,
    "role" "group_role" NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "groupRoleOrders_pkey" PRIMARY KEY ("groupId","role","index")
);

-- CreateIndex
CREATE INDEX "group_role_order_group_id" ON "groupRoleOrders"("groupId");

-- AddForeignKey
ALTER TABLE "groupRoleOrders" ADD CONSTRAINT "groupRoleOrders_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
