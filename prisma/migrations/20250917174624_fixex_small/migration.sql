/*
  Warnings:

  - You are about to drop the column `bookId` on the `BookCopy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BookCopy" DROP CONSTRAINT "BookCopy_bookId_fkey";

-- DropIndex
DROP INDEX "public"."BookCopy_barcode_bookId_idx";

-- AlterTable
ALTER TABLE "public"."BookCopy" DROP COLUMN "bookId";

-- CreateIndex
CREATE INDEX "BookCopy_barcode_id_idx" ON "public"."BookCopy"("barcode", "id");

-- AddForeignKey
ALTER TABLE "public"."BookCopy" ADD CONSTRAINT "BookCopy_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
