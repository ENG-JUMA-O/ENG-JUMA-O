-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GENERAL_SMS';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "donationId" DROP NOT NULL;
