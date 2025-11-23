/*
  Warnings:

  - You are about to alter the column `status` on the `delivery` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(6))`.
  - You are about to drop the column `expiresAt` on the `otp` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `otp` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `otp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `delivery` DROP FOREIGN KEY `Delivery_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `ticketlog` DROP FOREIGN KEY `TicketLog_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `uploadeddocument` DROP FOREIGN KEY `UploadedDocument_ticketId_fkey`;

-- AlterTable
ALTER TABLE `delivery` ADD COLUMN `actualDelivery` DATETIME(3) NULL,
    ADD COLUMN `agentName` VARCHAR(191) NULL,
    ADD COLUMN `agentPhone` VARCHAR(191) NULL,
    ADD COLUMN `estimatedDelivery` DATETIME(3) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `trackingNumber` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` ENUM('PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `otp` DROP COLUMN `expiresAt`,
    DROP COLUMN `metadata`,
    DROP COLUMN `otp`,
    ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `expireat` DATETIME(3) NULL,
    ADD COLUMN `metaData` TEXT NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `queuePosition` INTEGER NULL;

-- CreateTable
CREATE TABLE `VisitorCount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `page` VARCHAR(191) NULL,
    `visitedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VisitorCount_visitedAt_idx`(`visitedAt`),
    INDEX `VisitorCount_ipAddress_idx`(`ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Delivery_status_idx` ON `Delivery`(`status`);

-- CreateIndex
CREATE INDEX `Delivery_trackingNumber_idx` ON `Delivery`(`trackingNumber`);

-- CreateIndex
CREATE INDEX `OTP_email_code_idx` ON `OTP`(`email`, `code`);

-- CreateIndex
CREATE INDEX `OTP_expireat_idx` ON `OTP`(`expireat`);

-- CreateIndex
CREATE INDEX `Payment_status_idx` ON `Payment`(`status`);

-- CreateIndex
CREATE INDEX `Ticket_status_idx` ON `Ticket`(`status`);

-- CreateIndex
CREATE INDEX `Ticket_queuePosition_idx` ON `Ticket`(`queuePosition`);

-- CreateIndex
CREATE INDEX `Ticket_customerPriority_finalPriority_createdAt_idx` ON `Ticket`(`customerPriority`, `finalPriority`, `createdAt`);

-- CreateIndex
CREATE INDEX `Ticket_agentId_status_idx` ON `Ticket`(`agentId`, `status`);

-- CreateIndex
CREATE INDEX `Ticket_userId_createdAt_idx` ON `Ticket`(`userId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `TicketLog` ADD CONSTRAINT `TicketLog_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadedDocument` ADD CONSTRAINT `UploadedDocument_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `Payment_userId_fkey` TO `Payment_userId_idx`;

-- RenameIndex
ALTER TABLE `ticketlog` RENAME INDEX `TicketLog_ticketId_fkey` TO `TicketLog_ticketId_idx`;

-- RenameIndex
ALTER TABLE `uploadeddocument` RENAME INDEX `UploadedDocument_ticketId_fkey` TO `UploadedDocument_ticketId_idx`;
