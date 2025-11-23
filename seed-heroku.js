// Seed script for Heroku database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Heroku database seed...');

  // 1. Create Services
  console.log('\n📦 Creating services...');
  
  const services = [
    { name: 'New CNIC Registration', description: 'Fresh CNIC issuance for first time', fee: 0, defaultPriority: 'HIGH' },
    { name: 'CNIC Renewal', description: 'Renew expired CNIC', fee: 1000, defaultPriority: 'MEDIUM' },
    { name: 'CNIC Correction', description: 'Correct name, address, DOB or family info', fee: 800, defaultPriority: 'MEDIUM' },
    { name: 'Lost CNIC Replacement', description: 'Reissue lost CNIC', fee: 1500, defaultPriority: 'HIGH' },
    { name: 'Urgent CNIC Processing', description: 'Fast-track CNIC processing', fee: 2500, defaultPriority: 'HIGH' },
    { name: 'Family Registration Certificate (FRC)', description: 'Issue family certificate for visa or legal needs', fee: 600, defaultPriority: 'LOW' },
    { name: 'Birth Certificate Issuance', description: 'Issue birth certificate', fee: 500, defaultPriority: 'MEDIUM' },
    { name: 'Marriage Certificate Issuance', description: 'Issue marriage certificate', fee: 700, defaultPriority: 'MEDIUM' },
    { name: 'Death Certificate Issuance', description: 'Issue death certificate', fee: 500, defaultPriority: 'LOW' },
    { name: 'Document Verification', description: 'Verify CNIC / family record', fee: 300, defaultPriority: 'LOW' },
    { name: 'Passport Issuance', description: 'Apply for new passport', fee: 3000, defaultPriority: 'HIGH' },
    { name: 'Urgent Passport Issuance', description: 'Fast-track urgent passport', fee: 5000, defaultPriority: 'HIGH' },
    { name: 'Residence Certificate', description: 'Certificate for address proof', fee: 400, defaultPriority: 'LOW' },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name }
    });
    
    if (!existing) {
      await prisma.service.create({ data: service });
      console.log(`✅ Created: ${service.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${service.name}`);
    }
  }

  // 2. Create Admin User
  console.log('\n👤 Creating admin user...');
  
  const adminEmail = 'admin@nadra.gov.pk';
  const adminPassword = 'admin123'; // Change this!
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        cnic: null,
        phone: null,
      }
    });
    
    console.log('✅ Admin user created!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
  } else {
    console.log('⏭️  Admin already exists');
  }

  // 3. Create Sample Agent
  console.log('\n🕵️  Creating sample agent...');
  
  const agentUsername = 'agent1';
  const agentPassword = 'agent123'; // Change this!
  
  const existingAgent = await prisma.agent.findUnique({
    where: { username: agentUsername }
  });

  if (!existingAgent) {
    const hashedPassword = await bcrypt.hash(agentPassword, 10);
    
    await prisma.agent.create({
      data: {
        name: 'Agent Khan',
        email: 'agent@nadra.gov.pk',
        username: agentUsername,
        password: hashedPassword,
        maxTickets: 5,
      }
    });
    
    console.log('✅ Sample agent created!');
    console.log(`   Username: ${agentUsername}`);
    console.log(`   Password: ${agentPassword}`);
  } else {
    console.log('⏭️  Agent already exists');
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log('\nAgent:');
  console.log(`  Username: ${agentUsername}`);
  console.log(`  Password: ${agentPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
