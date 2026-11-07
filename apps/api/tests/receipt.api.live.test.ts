import "../src/environment";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setDefaultResultOrder } from "node:dns";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Opt-in check against the actual running API. Temporary staff/object are removed;
// no customer payments are created, verified, rejected, or changed.
test(
  "running API: login → private receipt upload → signed download",
  {
    skip: process.env.RUN_LIVE_API_TESTS !== "1",
    timeout: 90000,
  },
  async () => {
    setDefaultResultOrder("ipv4first");
    const prisma = new PrismaClient();
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const base = process.env.LIVE_API_URL || "http://localhost:5000";
    const origin = new URL(process.env.ADMIN_APP_URL || "http://localhost:3001")
      .origin;
    const id = randomUUID();
    const email = `receipt-test-${id}@example.invalid`;
    const password = randomUUID();
    let fileKey: string | undefined;
    try {
      await prisma.user.create({
        data: {
          id,
          email,
          fullName: "Temporary Receipt Test",
          passwordHash: await bcrypt.hash(password, 10),
          role: "SERVICE_COORDINATOR",
        },
      });
      const login = await fetch(`${base}/api/v1/auth/login`, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(20000),
      });
      assert.equal(login.status, 200, "Actual API login must succeed");
      const token = (await login.json()).data.accessToken;
      const response = await fetch(`${base}/api/v1/storage/upload-url`, {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: `api-regression-${id}.png`,
          contentType: "image/png",
          folder: "receipts",
        }),
        signal: AbortSignal.timeout(15000),
      });
      assert.equal(
        response.status,
        200,
        "Running API must have private R2 configured",
      );
      const upload = (await response.json()).data;
      fileKey = upload.fileKey;
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
      assert.ok(preflight.ok, "Browser CORS preflight must pass");
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        origin,
      );
      const content = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l1cAAAAASUVORK5CYII=",
        "base64",
      );
      const put = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { Origin: origin, "Content-Type": "image/png" },
        body: content,
        signal: AbortSignal.timeout(15000),
      });
      assert.ok(put.ok, "Actual API's signed upload must succeed");
      const downloadResponse = await fetch(
        `${base}/api/v1/storage/download-url?fileKey=${encodeURIComponent(fileKey!)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(15000),
        },
      );
      assert.equal(downloadResponse.status, 200);
      const download = (await downloadResponse.json()).data;
      assert.equal(
        new URL(download.downloadUrl).searchParams.get("X-Amz-Expires"),
        "900",
      );
      const get = await fetch(download.downloadUrl, {
        signal: AbortSignal.timeout(15000),
      });
      assert.equal(get.status, 200);
      assert.deepEqual(Buffer.from(await get.arrayBuffer()), content);
    } finally {
      try {
        if (fileKey)
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_PRIVATE_BUCKET || "flyora-private",
              Key: fileKey,
            }),
            { abortSignal: AbortSignal.timeout(15000) },
          );
      } finally {
        await prisma.user.deleteMany({ where: { id } });
        await prisma.$disconnect();
        s3.destroy();
      }
    }
  },
);
