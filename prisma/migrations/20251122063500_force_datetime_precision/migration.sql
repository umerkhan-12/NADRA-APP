-- Force DATETIME(3) precision for expiresAt column
ALTER TABLE `OTP` MODIFY COLUMN `expiresAt` DATETIME(3) NULL;
