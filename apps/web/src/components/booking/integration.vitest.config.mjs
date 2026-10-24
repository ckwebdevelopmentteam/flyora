import { defineConfig } from "vitest/config";

// Explicit opt-in; backend/Prisma test dependencies do not enter the web TS build.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/components/booking/realFlow.integration.test.mjs"],
  },
});
