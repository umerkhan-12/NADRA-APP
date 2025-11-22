-- Fix OTP expiresAt column to use proper DATETIME
ALTER TABLE `OTP` MODIFY COLUMN `expiresAt` DATETIME(3) NULL;

-- Clear any bad OTP data
DELETE FROM `OTP` WHERE `expiresAt` < NOW() OR `expiresAt` IS NULL;
