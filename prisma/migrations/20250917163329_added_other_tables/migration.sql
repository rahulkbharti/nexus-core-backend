-- CreateEnum
CREATE TYPE "public"."CopyStatus" AS ENUM ('AVAILABLE', 'ON_LOAN', 'DAMAGED', 'LOST');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CARD', 'ONLINE', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."FeeType" AS ENUM ('OVERDUE', 'MEMBERSHIP', 'LOST_BOOK', 'DAMAGED_BOOK', 'PRINTING', 'MISC');

-- CreateEnum
CREATE TYPE "public"."FeeStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateTable
CREATE TABLE "public"."Book" (
    "id" SERIAL NOT NULL,
    "ISBN" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "genre" TEXT NOT NULL,
    "synopsis" TEXT,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookCopy" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "status" "public"."CopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "dateAcquired" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "condition" TEXT,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalCapacity" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Seat" (
    "id" SERIAL NOT NULL,
    "hallId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "seatType" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeatReservation" (
    "id" SERIAL NOT NULL,
    "seatId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "reservationStartTime" TIMESTAMP(3) NOT NULL,
    "reservationEndTime" TIMESTAMP(3) NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "SeatReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookReservation" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "orgnizationId" INTEGER NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "holdUntilDate" TIMESTAMP(3),
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BookReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fee" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "type" "public"."FeeType" NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "status" "public"."FeeStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "feeId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_ISBN_key" ON "public"."Book"("ISBN");

-- CreateIndex
CREATE INDEX "Book_title_author_idx" ON "public"."Book"("title", "author");

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_barcode_key" ON "public"."BookCopy"("barcode");

-- CreateIndex
CREATE INDEX "BookCopy_barcode_bookId_idx" ON "public"."BookCopy"("barcode", "bookId");

-- CreateIndex
CREATE INDEX "Hall_name_organizationId_idx" ON "public"."Hall"("name", "organizationId");

-- CreateIndex
CREATE INDEX "Seat_hallId_seatNumber_idx" ON "public"."Seat"("hallId", "seatNumber");

-- CreateIndex
CREATE INDEX "SeatReservation_seatId_memberId_reservationStartTime_idx" ON "public"."SeatReservation"("seatId", "memberId", "reservationStartTime");

-- CreateIndex
CREATE INDEX "Fee_memberId_status_dueDate_idx" ON "public"."Fee"("memberId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Payment_memberId_organizationId_feeId_paymentDate_idx" ON "public"."Payment"("memberId", "organizationId", "feeId", "paymentDate");

-- AddForeignKey
ALTER TABLE "public"."Book" ADD CONSTRAINT "Book_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookCopy" ADD CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hall" ADD CONSTRAINT "Hall_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Seat" ADD CONSTRAINT "Seat_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "public"."Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatReservation" ADD CONSTRAINT "SeatReservation_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "public"."Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatReservation" ADD CONSTRAINT "SeatReservation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatReservation" ADD CONSTRAINT "SeatReservation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookReservation" ADD CONSTRAINT "BookReservation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookReservation" ADD CONSTRAINT "BookReservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookReservation" ADD CONSTRAINT "BookReservation_orgnizationId_fkey" FOREIGN KEY ("orgnizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fee" ADD CONSTRAINT "Fee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fee" ADD CONSTRAINT "Fee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "public"."Fee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
