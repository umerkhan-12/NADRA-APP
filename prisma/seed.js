import prisma from "../lib/prisma.js";

async function main() {
  console.log("🌱 Starting database seed...");

  // Get all existing services
  const existingServices = await prisma.service.findMany();
  
  if (existingServices.length === 0) {
    console.log("No services found. Creating services first...");
    
    // Create services
    const services = await Promise.all([
      prisma.service.create({ data: { name: "New CNIC Registration", description: "Fresh CNIC issuance for first time", fee: 0, defaultPriority: "HIGH" } }),
      prisma.service.create({ data: { name: "CNIC Renewal", description: "Renew expired CNIC", fee: 1000, defaultPriority: "MEDIUM" } }),
      prisma.service.create({ data: { name: "CNIC Correction", description: "Correct name, address, DOB or family info", fee: 800, defaultPriority: "MEDIUM" } }),
      prisma.service.create({ data: { name: "Lost CNIC Replacement", description: "Reissue lost CNIC", fee: 1500, defaultPriority: "HIGH" } }),
      prisma.service.create({ data: { name: "Urgent CNIC Processing", description: "Fast-track CNIC processing", fee: 2500, defaultPriority: "HIGH" } }),
      prisma.service.create({ data: { name: "Family Registration Certificate (FRC)", description: "Issue family certificate for visa or legal needs", fee: 600, defaultPriority: "LOW" } }),
      prisma.service.create({ data: { name: "Birth Certificate Issuance", description: "Issue birth certificate", fee: 500, defaultPriority: "MEDIUM" } }),
      prisma.service.create({ data: { name: "Marriage Certificate Issuance", description: "Issue marriage certificate", fee: 700, defaultPriority: "MEDIUM" } }),
      prisma.service.create({ data: { name: "Death Certificate Issuance", description: "Issue death certificate", fee: 500, defaultPriority: "LOW" } }),
      prisma.service.create({ data: { name: "Document Verification", description: "Verify CNIC / family record", fee: 300, defaultPriority: "LOW" } }),
      prisma.service.create({ data: { name: "Passport Issuance", description: "Apply for new passport", fee: 3000, defaultPriority: "HIGH" } }),
      prisma.service.create({ data: { name: "Urgent Passport Issuance", description: "Fast-track urgent passport", fee: 5000, defaultPriority: "HIGH" } }),
      prisma.service.create({ data: { name: "Residence Certificate", description: "Certificate for address proof", fee: 400, defaultPriority: "LOW" } })
    ]);

    console.log(`✓ Created ${services.length} services`);
  } else {
    console.log(`✓ Found ${existingServices.length} existing services`);
  }

  // Get services again to ensure we have the latest
  const services = await prisma.service.findMany({ orderBy: { id: 'asc' } });

  // Add required documents for each service
  const documentsData = [
    // New CNIC Registration
    { serviceId: services[0].id, documentName: "Birth Certificate", description: "Original or certified copy", isMandatory: true },
    { serviceId: services[0].id, documentName: "Passport Size Photos", description: "2 recent color photos", isMandatory: true },
    { serviceId: services[0].id, documentName: "B-Form / Birth Form", description: "For applicants under 18", isMandatory: true },
    { serviceId: services[0].id, documentName: "Guardian's CNIC", description: "Parent or guardian CNIC copy", isMandatory: true },

    // CNIC Renewal
    { serviceId: services[1].id, documentName: "Expired CNIC", description: "Original expired CNIC", isMandatory: true },
    { serviceId: services[1].id, documentName: "Passport Size Photos", description: "2 recent color photos", isMandatory: true },
    { serviceId: services[1].id, documentName: "Proof of Address", description: "Utility bill or rental agreement", isMandatory: false },

    // CNIC Correction
    { serviceId: services[2].id, documentName: "Current CNIC", description: "Original CNIC with errors", isMandatory: true },
    { serviceId: services[2].id, documentName: "Passport Size Photos", description: "2 recent color photos", isMandatory: true },
    { serviceId: services[2].id, documentName: "Supporting Documents", description: "Documents proving correct information", isMandatory: true },
    { serviceId: services[2].id, documentName: "Affidavit", description: "Sworn statement for name/DOB change", isMandatory: false },

    // Lost CNIC Replacement
    { serviceId: services[3].id, documentName: "FIR Copy", description: "Police report for lost CNIC", isMandatory: true },
    { serviceId: services[3].id, documentName: "Passport Size Photos", description: "2 recent color photos", isMandatory: true },
    { serviceId: services[3].id, documentName: "Affidavit", description: "Sworn statement of lost CNIC", isMandatory: true },

    // Urgent CNIC Processing
    { serviceId: services[4].id, documentName: "Previous CNIC", description: "Expired or lost CNIC proof", isMandatory: false },
    { serviceId: services[4].id, documentName: "Passport Size Photos", description: "2 recent color photos", isMandatory: true },
    { serviceId: services[4].id, documentName: "Urgency Proof", description: "Travel tickets, visa, emergency documents", isMandatory: true },

    // Family Registration Certificate (FRC)
    { serviceId: services[5].id, documentName: "CNIC of Head", description: "Family head CNIC copy", isMandatory: true },
    { serviceId: services[5].id, documentName: "CNICs of Family Members", description: "All family members' CNICs", isMandatory: true },
    { serviceId: services[5].id, documentName: "Marriage Certificate", description: "Nikah nama or marriage certificate", isMandatory: true },
    { serviceId: services[5].id, documentName: "Children's B-Forms", description: "Birth certificates of children", isMandatory: false },

    // Birth Certificate Issuance
    { serviceId: services[6].id, documentName: "Hospital Birth Record", description: "Birth notification from hospital", isMandatory: true },
    { serviceId: services[6].id, documentName: "Parents' CNICs", description: "Both parents' CNIC copies", isMandatory: true },
    { serviceId: services[6].id, documentName: "Marriage Certificate", description: "Parents' Nikah nama", isMandatory: true },
    { serviceId: services[6].id, documentName: "Vaccination Card", description: "Child's immunization record", isMandatory: false },

    // Marriage Certificate Issuance
    { serviceId: services[7].id, documentName: "Nikah Nama", description: "Original Islamic marriage contract", isMandatory: true },
    { serviceId: services[7].id, documentName: "CNICs of Couple", description: "Both spouses' CNIC copies", isMandatory: true },
    { serviceId: services[7].id, documentName: "Witnesses' CNICs", description: "Two witnesses' CNIC copies", isMandatory: true },
    { serviceId: services[7].id, documentName: "Passport Size Photos", description: "2 photos of each spouse", isMandatory: true },

    // Death Certificate Issuance
    { serviceId: services[8].id, documentName: "Hospital Death Report", description: "Medical death notification", isMandatory: true },
    { serviceId: services[8].id, documentName: "Deceased's CNIC", description: "CNIC of deceased person", isMandatory: true },
    { serviceId: services[8].id, documentName: "Applicant's CNIC", description: "Legal heir or relative CNIC", isMandatory: true },
    { serviceId: services[8].id, documentName: "Relationship Proof", description: "Document proving relationship", isMandatory: false },

    // Document Verification
    { serviceId: services[9].id, documentName: "Original Document", description: "Document to be verified", isMandatory: true },
    { serviceId: services[9].id, documentName: "CNIC", description: "Applicant's CNIC copy", isMandatory: true },

    // Passport Issuance
    { serviceId: services[10].id, documentName: "CNIC", description: "Original valid CNIC", isMandatory: true },
    { serviceId: services[10].id, documentName: "Passport Size Photos", description: "4 recent photos with blue background", isMandatory: true },
    { serviceId: services[10].id, documentName: "Previous Passport", description: "If renewal or lost passport", isMandatory: false },
    { serviceId: services[10].id, documentName: "Police Character Certificate", description: "For first-time applicants", isMandatory: false },

    // Urgent Passport Issuance
    { serviceId: services[11].id, documentName: "CNIC", description: "Original valid CNIC", isMandatory: true },
    { serviceId: services[11].id, documentName: "Passport Size Photos", description: "4 recent photos with blue background", isMandatory: true },
    { serviceId: services[11].id, documentName: "Travel Documents", description: "Tickets, visa, or urgent travel proof", isMandatory: true },
    { serviceId: services[11].id, documentName: "Previous Passport", description: "If renewal", isMandatory: false },

    // Residence Certificate
    { serviceId: services[12].id, documentName: "CNIC", description: "Applicant's CNIC copy", isMandatory: true },
    { serviceId: services[12].id, documentName: "Proof of Residence", description: "Utility bills (gas, electric, water)", isMandatory: true },
    { serviceId: services[12].id, documentName: "Rental Agreement", description: "If rented property", isMandatory: false },
    { serviceId: services[12].id, documentName: "Property Documents", description: "If owned property", isMandatory: false },
  ];

  await prisma.requiredDocument.createMany({ data: documentsData });

  console.log(`✓ Created ${documentsData.length} required documents for all services`);
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
