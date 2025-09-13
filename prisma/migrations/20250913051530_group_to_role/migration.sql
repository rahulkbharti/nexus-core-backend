/*
  Warnings:

  - You are about to drop the `StaffGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StaffGroupPermissions` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `adminUserId` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Organization" DROP CONSTRAINT "Organization_adminUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Staff" DROP CONSTRAINT "Staff_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StaffGroup" DROP CONSTRAINT "StaffGroup_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StaffGroupPermissions" DROP CONSTRAINT "_StaffGroupPermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StaffGroupPermissions" DROP CONSTRAINT "_StaffGroupPermissions_B_fkey";

-- AlterTable
ALTER TABLE "public"."Organization" ALTER COLUMN "adminUserId" SET NOT NULL;

-- DropTable
DROP TABLE "public"."StaffGroup";

-- DropTable
DROP TABLE "public"."_StaffGroupPermissions";

-- CreateTable
CREATE TABLE "public"."StaffRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "StaffRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_StaffRolePermissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StaffRolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "StaffRole_name_idx" ON "public"."StaffRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StaffRole_name_organizationId_key" ON "public"."StaffRole"("name", "organizationId");

-- CreateIndex
CREATE INDEX "_StaffRolePermissions_B_index" ON "public"."_StaffRolePermissions"("B");

-- CreateIndex
CREATE INDEX "User_email_name_idx" ON "public"."User"("email", "name");

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."Admin"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."StaffRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffRole" ADD CONSTRAINT "StaffRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StaffRolePermissions" ADD CONSTRAINT "_StaffRolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StaffRolePermissions" ADD CONSTRAINT "_StaffRolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."StaffRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
