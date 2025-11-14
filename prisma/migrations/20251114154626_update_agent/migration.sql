/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `agent` ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Agent_email_key` ON `Agent`(`email`);
