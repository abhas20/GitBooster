// prisma.config.js
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.prisma",
});
