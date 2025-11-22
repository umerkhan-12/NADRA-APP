-- Drop and recreate expiresAt column with proper DATETIME(3) type
ALTER TABLE `OTP` DROP COLUMN `expiresAt`;
ALTER TABLE `OTP` ADD COLUMN `expiresAt` DATETIME(3) NULL;
