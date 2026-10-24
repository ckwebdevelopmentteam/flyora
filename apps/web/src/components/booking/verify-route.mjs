// Run after building web: node apps/web/src/components/booking/verify-route.mjs
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { startVoucherServer } from "./testServer.mjs";

const fixture = JSON.parse(
  await readFile(
    new URL("./__fixtures__/public-booking.json", import.meta.url),
    "utf8",
  ),
);
const cases = {
  ready: "BK-2026-0042",
  paid: "BK-2026-0043",
  cancelled: "BK-2026-0044",
  missing: "BK-2026-0045",
  unavailable: "BK-2026-0046",
  sensitive: "BK-2026-0047",
};
const observed = [];
const api = createServer((request, response) => {
  observed.push(request);
  const ref = request.url.split("/").at(-1);
  response.setHeader("Content-Type", "application/json");
  if (ref === cases.missing) {
    response.writeHead(404).end('{"message":"Missing"}');
    return;
  }
  if (ref === cases.unavailable) {
    response.writeHead(503).end('{"message":"PRIVATE_ERROR_CANARY"}');
    return;
  }
  const data = { ...fixture.data, bookingRef: ref };
  if (ref === cases.paid)
    Object.assign(data, { paidAmount: 96000, dueAmount: 0, isFullyPaid: true });
  if (ref === cases.cancelled) Object.assign(data, { status: "CANCELLED" });
  if (ref === cases.sensitive) data.receiptFileKey = "PRIVATE_RECEIPT_CANARY";
  response.end(JSON.stringify({ statusCode: 200, data }));
});
await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
let web;
try {
  web = await startVoucherServer(
    `http://127.0.0.1:${api.address().port}/api/v1`,
  );
  for (const [kind, ref] of Object.entries(cases)) {
    const response = await fetch(`${web.url}/booking/${ref}`, {
      headers: {
        Cookie: "staff_session=PRIVATE_STAFF_CANARY",
        Authorization: "Bearer PRIVATE_STAFF_CANARY",
      },
      signal: AbortSignal.timeout(20000),
    });
    const html = await response.text();
    assert.match(html, /name="robots" content="[^"]*noindex[^"]*nofollow/);
    assert.match(html, /name="referrer" content="no-referrer"/);
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    assert.doesNotMatch(
      html,
      /PRIVATE_\w+_CANARY|supplierCost|marginAmount|marginPercent|transactionRef|receiptFileKey/,
    );
    if (kind === "missing") assert.match(html, /Booking reference not found/);
    else if (kind === "unavailable" || kind === "sensitive") {
      assert.match(html, /We couldn/);
      assert.doesNotMatch(html, /Amina Voucher Test/);
    } else {
      assert.equal(response.status, 200);
      assert.match(html, /Amina Voucher Test/);
      assert.match(html, /₹96,000/);
      if (kind === "paid") assert.match(html, /Fully Paid &amp; Verified/);
      if (kind === "cancelled") {
        assert.match(html, /not an active travel confirmation/);
        assert.doesNotMatch(html, /Fully Paid &amp; Verified/);
      }
      if (kind === "ready") {
        assert.match(html, /₹40,000/);
        assert.match(html, /₹56,000/);
        assert.match(html, /https:\/\/wa.me\/919876543210/);
        const paths = [
          ...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g),
        ].map((match) => match[1]);
        const css = (
          await Promise.all(
            paths.map(async (path) =>
              (await fetch(new URL(path, web.url))).text(),
            ),
          )
        ).join("\n");
        assert.match(css, /@media\s*print/);
        assert.match(css, /@page/);
        assert.match(css, /position:fixed/);
      }
    }
    console.log(`PASS: production booking voucher — ${kind}`);
  }
  assert.ok(
    observed.every(
      (request) =>
        request.url.startsWith("/api/v1/public/bookings/") &&
        !request.headers.authorization &&
        !request.headers.cookie,
    ),
  );
  console.log(
    "PASS: anonymous requests, private metadata, no-store pages and no internal/receipt data leakage",
  );
} finally {
  if (web) await web.close();
  api.closeAllConnections();
  await new Promise((resolve) => api.close(resolve));
}
