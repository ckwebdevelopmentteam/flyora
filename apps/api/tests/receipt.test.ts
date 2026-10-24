import { afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { StorageService } from "../src/modules/storage/storage.service";
import { BookingsService } from "../src/modules/bookings/bookings.service";
import type { FastifyInstance } from "fastify";

const keys = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PRIVATE_BUCKET",
];
let previous: Array<string | undefined>;
beforeEach(() => {
  previous = keys.map((key) => process.env[key]);
  process.env.R2_ACCOUNT_ID = "00000000000000000000000000000000";
  process.env.R2_ACCESS_KEY_ID = "local-test-access-key";
  process.env.R2_SECRET_ACCESS_KEY = "local-test-secret-key";
  process.env.R2_PRIVATE_BUCKET = "private-test-bucket";
});
afterEach(() => {
  mock.restoreAll();
  keys.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key];
    else process.env[key] = previous[index];
  });
});
const missing = () =>
  Object.assign(new Error("NotFound"), { $metadata: { httpStatusCode: 404 } });

describe("private payment receipt storage", () => {
  it("does not simulate private uploads/downloads when R2 is unconfigured", async () => {
    delete process.env.R2_ACCESS_KEY_ID;
    const storage = new StorageService();
    await assert.rejects(
      storage.getPresignedUploadUrl("slip.png", "image/png", "receipts"),
      { statusCode: 503 },
    );
    await assert.rejects(storage.getPresignedDownloadUrl("receipts/slip.png"), {
      statusCode: 503,
    });
    assert.equal(
      (
        await storage.getPresignedUploadUrl(
          "cover.png",
          "image/png",
          "packages",
        )
      ).isMock,
      true,
    );
  });
  it("checks the receipt in the private bucket and signs a 15-minute download", async () => {
    const send = mock.method(
      S3Client.prototype,
      "send",
      async (command: unknown) => {
        assert.ok(command instanceof HeadObjectCommand);
        assert.equal(command.input.Bucket, "private-test-bucket");
        return { ContentLength: 68, ContentType: "image/png" };
      },
    );
    const storage = new StorageService();
    await storage.assertReceiptExists("receipts/slip.png");
    const result = await storage.getPresignedDownloadUrl(
      "receipts/slip.png",
      900,
    );
    const url = new URL(result.downloadUrl);
    assert.equal(url.searchParams.get("X-Amz-Expires"), "900");
    assert.ok(
      url.hostname.startsWith("private-test-bucket.") ||
        url.pathname.includes("private-test-bucket"),
    );
    assert.equal(send.mock.callCount(), 1);
  });
  it("rejects missing receipts and storage outages without leaking provider errors", async () => {
    mock.method(S3Client.prototype, "send", async () => {
      throw missing();
    });
    await assert.rejects(
      new StorageService().assertReceiptExists("receipts/missing.png"),
      { statusCode: 404 },
    );
    mock.restoreAll();
    mock.method(S3Client.prototype, "send", async () => {
      throw new Error("PRIVATE_PROVIDER_ERROR");
    });
    await assert.rejects(
      new StorageService().assertReceiptExists("receipts/slip.png"),
      (error) => {
        assert.equal((error as { statusCode: number }).statusCode, 503);
        assert.ok(!(error as Error).message.includes("PRIVATE_PROVIDER_ERROR"));
        return true;
      },
    );
  });
  it("rejects non-receipt keys and malformed proof files", async () => {
    const send = mock.method(S3Client.prototype, "send", async () => ({
      ContentLength: 0,
      ContentType: "text/html",
    }));
    const storage = new StorageService();
    for (const key of [
      "packages/slip.png",
      "receipts/../slip.png",
      "https://example.test/slip.png",
    ])
      await assert.rejects(storage.assertReceiptExists(key), {
        statusCode: 400,
      });
    assert.equal(send.mock.callCount(), 0);
    await assert.rejects(storage.assertReceiptExists("receipts/slip.png"), {
      statusCode: 400,
    });
  });
  it("refuses to record a payment whose proof never reached storage", async () => {
    mock.method(StorageService.prototype, "assertReceiptExists", async () => {
      throw Object.assign(new Error("Receipt missing"), { statusCode: 404 });
    });
    const transaction = mock.fn();
    const service = new BookingsService({
      prisma: {
        booking: { findUnique: async () => ({ id: "bk-1", leadId: "lead-1" }) },
        $transaction: transaction,
      },
    } as unknown as FastifyInstance);
    await assert.rejects(
      service.recordPayment("staff-1", "bk-1", {
        bookingId: "bk-1",
        amount: 40000,
        method: "UPI",
        transactionRef: "UTR-123",
        receiptFileKey: "receipts/slip.png",
      }),
      { statusCode: 404 },
    );
    assert.equal(transaction.mock.callCount(), 0);
  });
  it("refuses verification of missing proof but still lets Accounts reject the broken record", async () => {
    const receiptCheck = mock.method(
      StorageService.prototype,
      "assertReceiptExists",
      async () => {
        throw Object.assign(new Error("Receipt missing"), { statusCode: 404 });
      },
    );
    const payment = {
      id: "pay-1",
      bookingId: "bk-1",
      amount: 40000,
      method: "UPI",
      receiptFileKey: "receipts/slip.png",
      booking: { id: "bk-1", leadId: "lead-1", totalAmount: 100000 },
      recordedBy: { fullName: "Staff" },
      paymentDate: new Date(),
      createdAt: new Date(),
    };
    const transaction = mock.fn(async (work: (tx: unknown) => unknown) =>
      work({
        payment: {
          update: async () => ({ ...payment, status: "REJECTED" }),
          findMany: async () => [],
        },
        booking: { update: async () => ({}) },
        leadActivity: { create: async () => ({}) },
      }),
    );
    const service = new BookingsService({
      prisma: {
        payment: { findUnique: async () => payment },
        $transaction: transaction,
      },
    } as unknown as FastifyInstance);
    await assert.rejects(
      service.verifyPayment("admin-1", "SUPER_ADMIN", "pay-1", {
        status: "VERIFIED",
      }),
      { statusCode: 404 },
    );
    assert.equal(transaction.mock.callCount(), 0);
    assert.equal(
      (
        await service.verifyPayment("admin-1", "SUPER_ADMIN", "pay-1", {
          status: "REJECTED",
        })
      ).status,
      "REJECTED",
    );
    assert.equal(receiptCheck.mock.callCount(), 1);
  });

  it("replaces a pending receipt atomically without modifying its amount or balance", async () => {
    const check = mock.method(
      StorageService.prototype,
      "assertReceiptExists",
      async () => {},
    );
    const update = mock.fn(async () => ({ count: 1 }));
    const audit = mock.fn(async () => ({}));
    const service = new BookingsService({
      prisma: {
        payment: {
          findUnique: async () => ({
            id: "pay-1",
            bookingId: "bk-1",
            status: "PENDING",
          }),
        },
        $transaction: async (work: (tx: unknown) => unknown) =>
          work({
            payment: { updateMany: update },
            booking: { findUniqueOrThrow: async () => ({ leadId: "lead-1" }) },
            leadActivity: { create: audit },
          }),
      },
    } as unknown as FastifyInstance);
    mock.method(service, "getBookingById", async () => ({}) as never);
    assert.deepEqual(
      await service.replacePaymentReceipt(
        "pay-1",
        "staff-1",
        "SUPER_ADMIN",
        "receipts/fixed.png",
      ),
      { id: "pay-1", status: "PENDING", receiptFileKey: "receipts/fixed.png" },
    );
    assert.deepEqual(update.mock.calls[0].arguments[0], {
      where: { id: "pay-1", status: "PENDING" },
      data: { receiptFileKey: "receipts/fixed.png" },
    });
    assert.equal(check.mock.callCount(), 1);
    assert.equal(audit.mock.callCount(), 1);
  });

  it("blocks receipt replacement after verification or loss of booking access", async () => {
    const check = mock.method(
      StorageService.prototype,
      "assertReceiptExists",
      async () => {},
    );
    const service = new BookingsService({
      prisma: {
        payment: {
          findUnique: async () => ({
            id: "pay-1",
            bookingId: "bk-1",
            status: "VERIFIED",
          }),
        },
      },
    } as unknown as FastifyInstance);
    mock.method(service, "getBookingById", async () => ({}) as never);
    await assert.rejects(
      service.replacePaymentReceipt(
        "pay-1",
        "staff-1",
        "SUPER_ADMIN",
        "receipts/fixed.png",
      ),
      { statusCode: 409 },
    );
    mock.restoreAll();
    mock.method(service, "getBookingById", async () => {
      throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
    });
    await assert.rejects(
      service.replacePaymentReceipt(
        "pay-1",
        "other-staff",
        "SERVICE_COORDINATOR",
        "receipts/fixed.png",
      ),
      { statusCode: 403 },
    );
    assert.equal(check.mock.callCount(), 0);
  });

  it("does not overwrite a payment whose status changes during receipt replacement", async () => {
    mock.method(
      StorageService.prototype,
      "assertReceiptExists",
      async () => {},
    );
    const audit = mock.fn();
    const service = new BookingsService({
      prisma: {
        payment: {
          findUnique: async () => ({
            id: "pay-1",
            bookingId: "bk-1",
            status: "PENDING",
          }),
        },
        $transaction: async (work: (tx: unknown) => unknown) =>
          work({
            payment: { updateMany: async () => ({ count: 0 }) },
            leadActivity: { create: audit },
          }),
      },
    } as unknown as FastifyInstance);
    mock.method(service, "getBookingById", async () => ({}) as never);
    await assert.rejects(
      service.replacePaymentReceipt(
        "pay-1",
        "staff-1",
        "SUPER_ADMIN",
        "receipts/fixed.png",
      ),
      { statusCode: 409 },
    );
    assert.equal(audit.mock.callCount(), 0);
  });
});
