/*
  Warnings:

  - You are about to drop the column `orgnizationId` on the `BookReservation` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `BookReservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BookReservation" DROP CONSTRAINT "BookReservation_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookReservation" DROP CONSTRAINT "BookReservation_orgnizationId_fkey";

-- AlterTable
ALTER TABLE "public"."BookReservation" DROP COLUMN "orgnizationId",
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."BookReservation" ADD CONSTRAINT "BookReservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookReservation" ADD CONSTRAINT "BookReservation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
