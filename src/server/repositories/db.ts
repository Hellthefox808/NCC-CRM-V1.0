import { PrismaClient } from "@prisma/client";

// Export singleton Prisma client
export const prisma = new PrismaClient();
