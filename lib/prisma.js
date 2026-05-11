import { PrismaClient } from "@prisma/client";

const prismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? [
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : ["error"],
};

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaClientOptions);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaClientOptions);
  }
  prisma = global.prisma;
}

export default prisma;
