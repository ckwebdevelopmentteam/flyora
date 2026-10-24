// Test-only production server. No browser automation or external deployment.
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

export async function startVoucherServer(apiUrl) {
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const require = createRequire(import.meta.url);
  const web = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      env: {
        ...process.env,
        NODE_ENV: "production",
        API_INTERNAL_URL: apiUrl,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "",
    error;
  web.stdout.on("data", (chunk) => {
    output += String(chunk);
  });
  web.stderr.on("data", (chunk) => {
    output += String(chunk);
  });
  web.on("error", (reason) => {
    error = reason;
  });
  const close = async () => {
    if (web.exitCode !== null || error) return;
    const exited = new Promise((resolve) => web.once("exit", resolve));
    web.kill("SIGTERM");
    await Promise.race([exited, delay(5000)]);
    if (web.exitCode === null && web.signalCode === null) {
      web.kill("SIGKILL");
      await exited;
    }
  };
  try {
    for (let i = 0; i < 100 && !output.includes("Ready"); i++) {
      if (error || web.exitCode !== null)
        throw error || new Error(output.slice(-1000));
      await delay(100);
    }
    if (!output.includes("Ready"))
      throw new Error("Voucher server did not start");
    return { url: `http://127.0.0.1:${port}`, close };
  } catch (reason) {
    await close();
    throw reason;
  }
}
