-- Add phoneNumber column to User table
ALTER TABLE `User` ADD COLUMN `phoneNumber` VARCHAR(191) NULL;

-- Add unique constraint on phoneNumber
ALTER TABLE `User` ADD UNIQUE INDEX `User_phoneNumber_key`(`phoneNumber`);

-- Insert migration record
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
VALUES (UUID(), '8c7b3e9f4a5d2c1b6e8f9a0d3c4e5f6a', NOW(), '20251121173551_add_phone_number_field', NULL, NULL, NOW(), 1);
