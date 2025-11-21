const mysql = require('mysql2/promise');

async function updateOTPTable() {
  const connection = await mysql.createConnection({
    host: 'yamanote.proxy.rlwy.net',
    port: 30592,
    user: 'root',
    password: 'SbsptmUQbMKrMFfewcjMKmXCPNBiWeEh',
    database: 'railway'
  });

  console.log('Connected to Railway MySQL...');

  try {
    // Run each ALTER TABLE command
    await connection.query('ALTER TABLE `OTP` MODIFY COLUMN `email` VARCHAR(191) NULL');
    console.log('✓ Made email nullable');

    await connection.query('ALTER TABLE `OTP` MODIFY COLUMN `code` VARCHAR(191) NULL');
    console.log('✓ Made code nullable');

    await connection.query('ALTER TABLE `OTP` ADD COLUMN `phoneNumber` VARCHAR(191) NULL');
    console.log('✓ Added phoneNumber column');

    await connection.query('ALTER TABLE `OTP` ADD COLUMN `otp` VARCHAR(191) NULL');
    console.log('✓ Added otp column');

    await connection.query('ALTER TABLE `OTP` ADD COLUMN `expiresAt` DATETIME(3) NULL');
    console.log('✓ Added expiresAt column');

    await connection.query('ALTER TABLE `OTP` ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false');
    console.log('✓ Added verified column');

    await connection.query('ALTER TABLE `OTP` ADD COLUMN `metadata` TEXT NULL');
    console.log('✓ Added metadata column');

    console.log('\n✅ OTP table updated successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Column already exists, skipping...');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

updateOTPTable().catch(console.error);
