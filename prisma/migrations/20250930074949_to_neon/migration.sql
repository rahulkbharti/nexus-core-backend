-- AlterTable
ALTER TABLE "public"."BookCopy" ALTER COLUMN "dateAcquired" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Fee" ALTER COLUMN "type" SET DEFAULT 'MEMBERSHIP';
