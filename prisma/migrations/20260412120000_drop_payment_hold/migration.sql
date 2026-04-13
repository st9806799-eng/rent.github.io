-- Payment (LiqPay / Monobank) removed: release holds and drop hold column.
UPDATE "Reservation" SET status = 'cancelled' WHERE status = 'pending_payment';

-- Redefine table without paymentExpiresAt (SQLite).
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientTelegramChatId" TEXT,
    "reminderLinkToken" TEXT,
    "reminderSentAt" DATETIME,
    CONSTRAINT "Reservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reservation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("id", "branchId", "serviceId", "startAt", "endAt", "clientName", "clientPhone", "status", "createdAt", "clientTelegramChatId", "reminderLinkToken", "reminderSentAt")
SELECT "id", "branchId", "serviceId", "startAt", "endAt", "clientName", "clientPhone", "status", "createdAt", "clientTelegramChatId", "reminderLinkToken", "reminderSentAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE UNIQUE INDEX "Reservation_reminderLinkToken_key" ON "Reservation"("reminderLinkToken");
CREATE INDEX "Reservation_branchId_startAt_idx" ON "Reservation"("branchId", "startAt");
CREATE INDEX "Reservation_clientPhone_branchId_idx" ON "Reservation"("clientPhone", "branchId");
PRAGMA foreign_keys=ON;
