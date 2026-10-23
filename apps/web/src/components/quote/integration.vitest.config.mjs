import { defineConfig } from "vitest/config";

// Run explicitly with --config src/components/quote/integration.vitest.config.mjs
// and TEST_DATABASE_URL pointing to an isolated local *_test database.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/components/quote/realFlow.integration.test.mjs"],
  },
});
