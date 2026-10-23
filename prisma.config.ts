import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"] || "",
    shadowDatabaseUrl: process.env["DIRECT_URL"] || undefined,
  },
});
