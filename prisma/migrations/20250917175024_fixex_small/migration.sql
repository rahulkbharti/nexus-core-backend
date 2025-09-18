/*
  Warnings:

  - Added the required column `bookId` to the `BookCopy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BookCopy" DROP CONSTRAINT "BookCopy_id_fkey";

-- DropIndex
DROP INDEX "public"."BookCopy_barcode_id_idx";

-- AlterTable
ALTER TABLE "public"."BookCopy" ADD COLUMN     "bookId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "BookCopy_barcode_bookId_idx" ON "public"."BookCopy"("barcode", "bookId");

-- AddForeignKey
ALTER TABLE "public"."BookCopy" ADD CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
