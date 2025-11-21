/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_phoneNumber_key` ON `user`;

-- AlterTable
ALTER TABLE `otp` ADD COLUMN `expiresAt` DATETIME(3) NULL,
    ADD COLUMN `metadata` TEXT NULL,
    ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `phoneNumber`;
