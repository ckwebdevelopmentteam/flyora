import path from "node:path";
import dotenv from "dotenv";

// Load before Prisma: its generated client also loads the root .env on import.
// Explicit deployment variables win, then API-local values, then root defaults.
export function loadApiEnvironment(
  apiDirectory = path.resolve(__dirname, ".."),
  environment: dotenv.DotenvPopulateInput = process.env as dotenv.DotenvPopulateInput,
) {
  dotenv.config({
    path: path.join(apiDirectory, ".env"),
    processEnv: environment,
  });
  dotenv.config({
    path: path.resolve(apiDirectory, "../../.env"),
    processEnv: environment,
  });
}

loadApiEnvironment();
