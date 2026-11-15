/*
  Warnings:

  - A unique constraint covering the columns `[payHeroReference]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "payHeroReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_payHeroReference_key" ON "Donation"("payHeroReference");
