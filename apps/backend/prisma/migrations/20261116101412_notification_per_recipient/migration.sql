/*
  Warnings:

  - You are about to drop the column `message` on the `Donation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[donationId,type,recipient]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Notification_donationId_type_key";

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "message";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "message" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_donationId_type_recipient_key" ON "Notification"("donationId", "type", "recipient");
