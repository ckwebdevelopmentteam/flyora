import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadApiEnvironment } from "../src/environment";

test("API-local environment wins over root defaults regardless of cwd", () => {
  const root = mkdtempSync(path.join(tmpdir(), "flyora-env-"));
  const api = path.join(root, "apps/api");
  mkdirSync(api, { recursive: true });
  try {
    writeFileSync(
      path.join(root, ".env"),
      "R2_ACCESS_KEY_ID=your-placeholder\nROOT_DEFAULT=fallback\n",
    );
    writeFileSync(path.join(api, ".env"), "R2_ACCESS_KEY_ID=api-configured\n");
    const environment: Record<string, string> = {};
    loadApiEnvironment(api, environment);
    assert.equal(environment.R2_ACCESS_KEY_ID, "api-configured");
    assert.equal(environment.ROOT_DEFAULT, "fallback");
    const deployment = { R2_ACCESS_KEY_ID: "deployment-configured" };
    loadApiEnvironment(api, deployment);
    assert.equal(deployment.R2_ACCESS_KEY_ID, "deployment-configured");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("environment initializes before Prisma can load root placeholders", () => {
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    R2_ACCESS_KEY_ID: "deployment-regression-test",
  };
  const script = `
    require(${JSON.stringify(path.resolve(__dirname, "../src/environment.ts"))});
    const before = process.env.R2_ACCESS_KEY_ID;
    require('@flyora/database');
    if (before !== 'deployment-regression-test' || process.env.R2_ACCESS_KEY_ID !== before) process.exit(1);
  `;
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "-e", script],
    {
      cwd: path.resolve(__dirname, "../../.."),
      env: environment,
      encoding: "utf8",
    },
  );
  assert.equal(
    result.status,
    0,
    "Prisma must preserve initialized API environment",
  );
});
