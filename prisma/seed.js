import prisma from "../lib/prisma.js";


async function main() {
  await prisma.service.createMany({
    data: [
      { name: "New CNIC Registration", description: "Fresh CNIC issuance for first time", fee: 0, defaultPriority: "HIGH" },
      { name: "CNIC Renewal", description: "Renew expired CNIC", fee: 1000, defaultPriority: "MEDIUM" },
      { name: "CNIC Correction", description: "Correct name, address, DOB or family info", fee: 800, defaultPriority: "MEDIUM" },
      { name: "Lost CNIC Replacement", description: "Reissue lost CNIC", fee: 1500, defaultPriority: "HIGH" },
      { name: "Urgent CNIC Processing", description: "Fast-track CNIC processing", fee: 2500, defaultPriority: "HIGH" },
      { name: "Family Registration Certificate (FRC)", description: "Issue family certificate for visa or legal needs", fee: 600, defaultPriority: "LOW" },
      { name: "Birth Certificate Issuance", description: "Issue birth certificate", fee: 500, defaultPriority: "MEDIUM" },
      { name: "Marriage Certificate Issuance", description: "Issue marriage certificate", fee: 700, defaultPriority: "MEDIUM" },
      { name: "Death Certificate Issuance", description: "Issue death certificate", fee: 500, defaultPriority: "LOW" },
      { name: "Document Verification", description: "Verify CNIC / family record", fee: 300, defaultPriority: "LOW" },
      { name: "Passport Issuance", description: "Apply for new passport", fee: 3000, defaultPriority: "HIGH" },
      { name: "Urgent Passport Issuance", description: "Fast-track urgent passport", fee: 5000, defaultPriority: "HIGH" },
      { name: "Residence Certificate", description: "Certificate for address proof", fee: 400, defaultPriority: "LOW" }
    ],
  });

  console.log("Service table seeded successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
