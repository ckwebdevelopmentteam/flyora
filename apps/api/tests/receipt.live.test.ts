import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setDefaultResultOrder } from "node:dns";
import path from "node:path";
import dotenv from "dotenv";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { StorageService } from "../src/modules/storage/storage.service";

// Explicit opt-in: creates one synthetic PNG and deletes it in finally.
// Never records or verifies a financial payment, or reads customer receipts.
test(
  "live R2 receipt: browser preflight → signed PUT → private HEAD → signed GET → cleanup",
  {
    skip: process.env.RUN_LIVE_R2_TESTS !== "1",
    timeout: 60000,
  },
  async () => {
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
    setDefaultResultOrder("ipv4first");
    for (const key of [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
    ])
      assert.ok(process.env[key], `${key} must be configured`);
    const origin = new URL(process.env.ADMIN_APP_URL || "http://localhost:3001")
      .origin;
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const storage = new StorageService();
    const upload = await storage.getPresignedUploadUrl(
      `integration-receipt-${randomUUID()}.png`,
      "image/png",
      "receipts",
    );
    const content = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l1cAAAAASUVORK5CYII=",
      "base64",
    );
    try {
      assert.equal(upload.isMock, false);
      assert.equal(upload.publicUrl, "");
      const preflight = await fetch(upload.uploadUrl, {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "PUT",
          "Access-Control-Request-Headers": "content-type",
        },
        signal: AbortSignal.timeout(15000),
      });
      assert.ok(preflight.ok, `Browser preflight returned ${preflight.status}`);
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        origin,
      );
      const put = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/png", Origin: origin },
        body: content,
        signal: AbortSignal.timeout(15000),
      });
      assert.ok(put.ok, `Signed upload returned ${put.status}`);
      assert.equal(put.headers.get("access-control-allow-origin"), origin);
      await storage.assertReceiptExists(upload.fileKey);
      const download = await storage.getPresignedDownloadUrl(
        upload.fileKey,
        900,
      );
      assert.equal(
        new URL(download.downloadUrl).searchParams.get("X-Amz-Expires"),
        "900",
      );
      const get = await fetch(download.downloadUrl, {
        headers: { Origin: origin },
        signal: AbortSignal.timeout(15000),
      });
      assert.equal(get.status, 200);
      assert.deepEqual(Buffer.from(await get.arrayBuffer()), content);
      console.log(
        "Live private R2 upload, receipt existence, browser CORS and signed download passed.",
      );
    } finally {
      await client.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_PRIVATE_BUCKET || "flyora-private",
          Key: upload.fileKey,
        }),
        { abortSignal: AbortSignal.timeout(15000) },
      );
      client.destroy();
    }
  },
);
