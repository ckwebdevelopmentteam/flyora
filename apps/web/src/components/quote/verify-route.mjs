// Optional production HTTP smoke check. Synthetic backend, no real customer data.
// Run from repository root after building @flyora/web. Both servers are cleaned up.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createServer as reservePort } from "node:net";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = JSON.parse(
  await readFile(
    new URL("./__fixtures__/public-quote.json", import.meta.url),
    "utf8",
  ),
);
const tokens = {
  ready: fixture.data.shareToken,
  expired: "11a4e63d-6c45-44db-9b74-d083fe0b3b3b",
  missing: "22a4e63d-6c45-44db-9b74-d083fe0b3b3b",
  unavailable: "33a4e63d-6c45-44db-9b74-d083fe0b3b3b",
  sensitive: "44a4e63d-6c45-44db-9b74-d083fe0b3b3b",
};
const observed = [];
const api = createServer((request, response) => {
  observed.push(request);
  const token = request.url?.split("/").at(-1);
  response.setHeader("Content-Type", "application/json");
  if (token === tokens.missing) {
    response.writeHead(404).end(JSON.stringify({ message: "Missing" }));
    return;
  }
  if (token === tokens.unavailable) {
    response
      .writeHead(503)
      .end(JSON.stringify({ message: "INTERNAL_PRIVATE_CANARY" }));
    return;
  }
  const data = { ...fixture.data, shareToken: token };
  if (token === tokens.expired)
    Object.assign(data, {
      status: "EXPIRED",
      isExpired: true,
      validUntil: "2020-01-01T00:00:00.000Z",
    });
  if (token === tokens.sensitive)
    data.items = fixture.data.items.map((item) => ({
      ...item,
      supplierCost: 12345,
      notes: "INTERNAL_PRIVATE_CANARY",
    }));
  response.end(JSON.stringify({ statusCode: 200, data }));
});
await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
const apiPort = api.address().port;
const reservation = reservePort();
await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
const webPort = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const web = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "apps/web",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(webPort),
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      API_INTERNAL_URL: `http://127.0.0.1:${apiPort}/api/v1`,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let output = "";
web.stdout.on("data", (chunk) => {
  output += chunk;
});
web.stderr.on("data", (chunk) => {
  output += chunk;
});
try {
  const base = `http://127.0.0.1:${webPort}`;
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (web.exitCode !== null)
      throw new Error(`Next server exited: ${output.slice(-1000)}`);
    try {
      await fetch(`${base}/quote/${tokens.missing}`, {
        signal: AbortSignal.timeout(1500),
      });
      ready = true;
      break;
    } catch {
      await delay(250);
    }
  }
  assert.ok(ready, "Next server started");
  for (const [kind, token] of Object.entries(tokens)) {
    const response = await fetch(`${base}/quote/${token}`, {
      headers: {
        Cookie: "staff_session=NEVER_FORWARD_THIS",
        Authorization: "Bearer NEVER_FORWARD_THIS",
      },
      signal: AbortSignal.timeout(20000),
    });
    const html = await response.text();
    assert.match(html, /name="robots" content="[^"]*noindex[^"]*nofollow/);
    assert.match(html, /name="referrer" content="no-referrer"/);
    assert.doesNotMatch(
      html,
      /INTERNAL_PRIVATE_CANARY|supplierCost|marginAmount|marginPercent|NEVER_FORWARD_THIS/,
    );
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    if (kind === "ready") {
      assert.equal(response.status, 200);
      assert.match(html, /Flyora Travels[^<]*Your Custom Quotation/);
      const cssPaths = [
        ...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g),
      ].map((match) => match[1]);
      const css = (
        await Promise.all(
          cssPaths.map(async (path) =>
            (await fetch(new URL(path, base))).text(),
          ),
        )
      ).join("\n");
      assert.match(css, /@media\s*print/);
      assert.match(css, /@page/);
      assert.match(css, /position:fixed/);
      assert.match(html, /Amina Test/);
      assert.match(html, /FLY-2026-0042/);
      assert.match(html, /Accept &amp; Confirm via WhatsApp/);
      assert.match(html, /https:\/\/wa.me\/919876543210/);
      assert.doesNotMatch(html, /&quot;shareToken&quot;|\\"shareToken\\"/);
    } else if (kind === "expired") {
      assert.match(html, /This quotation expired/);
      assert.match(html, /Request an Updated Quote/);
      assert.doesNotMatch(html, /Accept &amp; Confirm via WhatsApp/);
    } else if (kind === "missing") {
      // Next's loading stream may already have committed HTTP 200 before notFound.
      assert.ok(response.status === 200 || response.status === 404);
      assert.match(html, /Quotation not found or link has expired/);
    } else {
      assert.match(html, /We couldn/);
      assert.doesNotMatch(html, /Amina Test/);
    }
    console.log(`PASS: production quote route — ${kind}`);
  }
  assert.ok(
    observed.every(
      (request) =>
        request.url.startsWith("/api/v1/public/quotes/") &&
        !request.headers.authorization &&
        !request.headers.cookie,
    ),
  );
  console.log(
    "PASS: public-only requests; no staff credentials forwarded; private metadata and no-store HTML",
  );
} finally {
  web.kill("SIGTERM");
  api.closeAllConnections();
  await new Promise((resolve) => api.close(resolve));
  if (web.exitCode === null)
    await new Promise((resolve) => {
      web.once("exit", resolve);
      setTimeout(() => {
        if (web.exitCode === null) web.kill("SIGKILL");
        resolve();
      }, 5000).unref();
    });
}
