/*
  Warnings:

  - You are about to drop the column `priority` on the `ticket` table. All the data in the column will be lost.
  - Added the required column `finalPriority` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicePriority` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket` DROP COLUMN `priority`,
    ADD COLUMN `customerPriority` ENUM('NORMAL', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    ADD COLUMN `finalPriority` INTEGER NOT NULL,
    ADD COLUMN `servicePriority` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL;
