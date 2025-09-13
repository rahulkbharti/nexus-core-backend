/*
  Warnings:

  - You are about to drop the column `groupId` on the `Staff` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Staff" DROP CONSTRAINT "Staff_groupId_fkey";

-- AlterTable
ALTER TABLE "public"."Staff" DROP COLUMN "groupId",
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."StaffRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
