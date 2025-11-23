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

  // 2. Create Required Documents for Services
  console.log('\n📄 Creating required documents for services...');
  
  const requiredDocuments = [
    // New CNIC Registration
    { serviceName: 'New CNIC Registration', documentName: 'Birth Certificate', description: 'Original birth certificate or hospital certificate', isMandatory: true },
    { serviceName: 'New CNIC Registration', documentName: 'Family Registration Certificate (B-Form)', description: 'Valid B-Form for minors', isMandatory: true },
    { serviceName: 'New CNIC Registration', documentName: 'Parent CNIC', description: 'Copy of parent/guardian CNIC', isMandatory: true },
    
    // CNIC Renewal
    { serviceName: 'CNIC Renewal', documentName: 'Expired CNIC', description: 'Original expired CNIC card', isMandatory: true },
    { serviceName: 'CNIC Renewal', documentName: 'Proof of Address', description: 'Utility bill or rental agreement', isMandatory: false },
    
    // CNIC Correction
    { serviceName: 'CNIC Correction', documentName: 'Current CNIC', description: 'Original CNIC to be corrected', isMandatory: true },
    { serviceName: 'CNIC Correction', documentName: 'Supporting Documents', description: 'Birth certificate, school certificate, or affidavit for corrections', isMandatory: true },
    
    // Lost CNIC Replacement
    { serviceName: 'Lost CNIC Replacement', documentName: 'FIR or Lost Report', description: 'Police report for lost CNIC', isMandatory: true },
    { serviceName: 'Lost CNIC Replacement', documentName: 'Affidavit', description: 'Sworn affidavit for lost CNIC', isMandatory: true },
    
    // Urgent CNIC Processing
    { serviceName: 'Urgent CNIC Processing', documentName: 'Required Documents', description: 'All documents as per service type (new/renewal/correction)', isMandatory: true },
    { serviceName: 'Urgent CNIC Processing', documentName: 'Urgency Proof', description: 'Travel tickets, medical emergency, or official letter', isMandatory: true },
    
    // Family Registration Certificate (FRC)
    { serviceName: 'Family Registration Certificate (FRC)', documentName: 'CNIC of Head', description: 'Valid CNIC of family head', isMandatory: true },
    { serviceName: 'Family Registration Certificate (FRC)', documentName: 'Marriage Certificate', description: 'Valid marriage certificate (Nikahnama)', isMandatory: true },
    { serviceName: 'Family Registration Certificate (FRC)', documentName: 'Children Birth Certificates', description: 'Birth certificates of all children', isMandatory: false },
    
    // Birth Certificate Issuance
    { serviceName: 'Birth Certificate Issuance', documentName: 'Hospital Certificate', description: 'Original hospital birth certificate', isMandatory: true },
    { serviceName: 'Birth Certificate Issuance', documentName: 'Parents CNIC', description: 'Copy of both parents CNIC', isMandatory: true },
    { serviceName: 'Birth Certificate Issuance', documentName: 'Marriage Certificate', description: 'Valid marriage certificate', isMandatory: false },
    
    // Marriage Certificate Issuance
    { serviceName: 'Marriage Certificate Issuance', documentName: 'Nikahnama', description: 'Original Nikahnama (marriage contract)', isMandatory: true },
    { serviceName: 'Marriage Certificate Issuance', documentName: 'CNICs', description: 'Copy of both spouses CNIC', isMandatory: true },
    { serviceName: 'Marriage Certificate Issuance', documentName: 'Witnesses CNIC', description: 'Copy of witnesses CNIC', isMandatory: true },
    
    // Death Certificate Issuance
    { serviceName: 'Death Certificate Issuance', documentName: 'Death Report', description: 'Hospital death certificate or medical report', isMandatory: true },
    { serviceName: 'Death Certificate Issuance', documentName: 'Deceased CNIC', description: 'Copy of deceased person CNIC', isMandatory: true },
    { serviceName: 'Death Certificate Issuance', documentName: 'Applicant CNIC', description: 'CNIC of person applying (family member)', isMandatory: true },
    
    // Document Verification
    { serviceName: 'Document Verification', documentName: 'Original Documents', description: 'Original documents to be verified', isMandatory: true },
    { serviceName: 'Document Verification', documentName: 'Applicant CNIC', description: 'Valid CNIC of applicant', isMandatory: true },
    
    // Passport Issuance
    { serviceName: 'Passport Issuance', documentName: 'Valid CNIC', description: 'Valid CNIC (must not be expired)', isMandatory: true },
    { serviceName: 'Passport Issuance', documentName: 'Passport Size Photos', description: '4 recent passport size photographs (blue background)', isMandatory: true },
    { serviceName: 'Passport Issuance', documentName: 'Old Passport', description: 'Old passport if renewal', isMandatory: false },
    
    // Urgent Passport Issuance
    { serviceName: 'Urgent Passport Issuance', documentName: 'Valid CNIC', description: 'Valid CNIC (must not be expired)', isMandatory: true },
    { serviceName: 'Urgent Passport Issuance', documentName: 'Passport Size Photos', description: '4 recent passport size photographs (blue background)', isMandatory: true },
    { serviceName: 'Urgent Passport Issuance', documentName: 'Travel Documents', description: 'Confirmed flight tickets or visa', isMandatory: true },
    
    // Residence Certificate
    { serviceName: 'Residence Certificate', documentName: 'Valid CNIC', description: 'Valid CNIC showing current address', isMandatory: true },
    { serviceName: 'Residence Certificate', documentName: 'Proof of Residence', description: 'Utility bill, rental agreement, or property documents', isMandatory: true },
  ];

  let documentsCreated = 0;
  for (const doc of requiredDocuments) {
    const service = await prisma.service.findFirst({
      where: { name: doc.serviceName }
    });
    
    if (service) {
      const existing = await prisma.requiredDocument.findFirst({
        where: {
          serviceId: service.id,
          documentName: doc.documentName
        }
      });
      
      if (!existing) {
        await prisma.requiredDocument.create({
          data: {
            serviceId: service.id,
            documentName: doc.documentName,
            description: doc.description,
            isMandatory: doc.isMandatory
          }
        });
        documentsCreated++;
      }
    }
  }
  console.log(`✅ Created ${documentsCreated} required documents`);

  // 3. Create Admin User
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

  // 4. Create Sample Agent
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
