-- AlterTable
ALTER TABLE "Business" ADD COLUMN "telegramChatId" TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "clientTelegramChatId" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "reminderLinkToken" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "reminderSentAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reminderLinkToken_key" ON "Reservation"("reminderLinkToken");
