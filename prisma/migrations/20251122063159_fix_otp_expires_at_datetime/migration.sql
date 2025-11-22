/*
  Warnings:

  - You are about to drop the column `metadata` on the `otp` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `otp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `otp` DROP COLUMN `metadata`,
    DROP COLUMN `otp`,
    ADD COLUMN `metaData` TEXT NULL;
