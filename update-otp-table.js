const mysql = require('mysql2/promise');

async function updateOTPTable() {
  console.log('Connecting to Railway MySQL...');
  console.log('Host: yamanote.proxy.rlwy.net:30592');
  
  const connection = await mysql.createConnection({
    host: 'yamanote.proxy.rlwy.net',
    port: 30592,
    user: 'root',
    password: 'SbsptmUQbMKrMFfewcjMKmXCPNBiWeEh',
    database: 'railway',
    connectTimeout: 120000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  console.log('✓ Connected to Railway MySQL!\n');

  try {
    // Check current OTP table structure
    console.log('Checking OTP table structure...');
    const [columns] = await connection.query('SHOW COLUMNS FROM `OTP`');
    console.log('Current columns:', columns.map(c => `${c.Field} (${c.Type}, Null: ${c.Null})`).join('\n'));
    
    console.log('\nUpdating table...\n');

    // Fix expiresAt column to DATETIME(3)
    try {
      await connection.query('ALTER TABLE `OTP` MODIFY COLUMN `expiresAt` DATETIME(3) NULL');
      console.log('✓ Fixed expiresAt to DATETIME(3)');
    } catch (e) {
      console.log('⚠️  expiresAt column:', e.message);
    }

    // Make email nullable
    try {
      await connection.query('ALTER TABLE `OTP` MODIFY COLUMN `email` VARCHAR(191) NULL');
      console.log('✓ Made email nullable');
    } catch (e) {
      console.log('⚠️  Email column:', e.message);
    }

    // Make code nullable
    try {
      await connection.query('ALTER TABLE `OTP` MODIFY COLUMN `code` VARCHAR(191) NULL');
      console.log('✓ Made code nullable');
    } catch (e) {
      console.log('⚠️  Code column:', e.message);
    }
    
    // Clean expired OTPs
    try {
      const [result] = await connection.query('DELETE FROM `OTP` WHERE `expiresAt` < NOW()');
      console.log(`✓ Deleted ${result.affectedRows} expired OTPs`);
    } catch (e) {
      console.log('⚠️  Cleanup:', e.message);
    }

    console.log('\n✅ OTP table updated successfully!');
    
    // Verify changes
    console.log('\nVerifying changes...');
    const [newColumns] = await connection.query('SHOW COLUMNS FROM `OTP`');
    console.log('Updated columns:', newColumns.map(c => `${c.Field} (${c.Type}, Null: ${c.Null})`).join('\n'));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
    console.log('\n✓ Connection closed');
  }
}

updateOTPTable().catch(err => {
  console.error('Failed to connect:', err.message);
  console.error('Make sure Railway MySQL is running and accessible');
});
