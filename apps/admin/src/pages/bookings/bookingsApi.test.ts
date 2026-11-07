// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../lib/apiClient";
import { bookingsApi } from "./bookingsApi";
import { receiptContentType } from "./receiptUpload";

vi.mock("../../lib/apiClient", () => ({
  apiClient: { post: vi.fn(), get: vi.fn(), patch: vi.fn() },
}));
const uploadUrl =
  "https://private.example.test/receipts/slip.png?signature=temporary";
const uploaded = { uploadUrl, fileKey: "receipts/slip.png", isMock: false };
const file = () =>
  new File(["receipt proof"], "slip.png", { type: "image/png" });
beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("private receipt upload", () => {
  it("uses the API filename contract and only returns a private key after a successful PUT", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(uploaded);
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    const receipt = file();
    expect(await bookingsApi.uploadReceiptSlip(receipt)).toEqual({
      fileKey: "receipts/slip.png",
    });
    expect(apiClient.post).toHaveBeenCalledWith("/storage/upload-url", {
      filename: "slip.png",
      contentType: "image/png",
      folder: "receipts",
    });
    expect(fetcher).toHaveBeenCalledWith(
      uploadUrl,
      expect.objectContaining({
        method: "PUT",
        body: receipt,
        credentials: "omit",
        redirect: "error",
        headers: { "Content-Type": "image/png" },
      }),
    );
  });
  it.each([403, 500])(
    "does not report a %s upload as success",
    async (status) => {
      vi.mocked(apiClient.post).mockResolvedValue(uploaded);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("PRIVATE_ERROR", { status })),
      );
      await expect(bookingsApi.uploadReceiptSlip(file())).rejects.toThrow(
        "storage rejected",
      );
    },
  );
  it("propagates presign failures and never substitutes a local preview", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new Error("Private storage unavailable"),
    );
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(bookingsApi.uploadReceiptSlip(file())).rejects.toThrow(
      "Private storage unavailable",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("reports network/CORS failures without exposing signed URL details", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(uploaded);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(uploadUrl)));
    await expect(bookingsApi.uploadReceiptSlip(file())).rejects.toThrow(
      "Check your connection",
    );
  });
  it.each([
    { ...uploaded, isMock: true },
    { ...uploaded, isMock: undefined },
    { ...uploaded, fileKey: "packages/slip.png" },
  ])("rejects simulated or non-receipt storage responses", async (response) => {
    vi.mocked(apiClient.post).mockResolvedValue(response);
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(bookingsApi.uploadReceiptSlip(file())).rejects.toThrow(
      "Private receipt storage is unavailable",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("supports a PDF whose browser MIME type is missing", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(uploaded);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );
    await bookingsApi.uploadReceiptSlip(new File(["pdf"], "slip.PDF"));
    expect(apiClient.post).toHaveBeenCalledWith(
      "/storage/upload-url",
      expect.objectContaining({
        filename: "slip.PDF",
        contentType: "application/pdf",
      }),
    );
  });
  it("rejects empty, unsupported and oversized files before making an API request", async () => {
    for (const invalid of [
      new File([], "empty.png", { type: "image/png" }),
      new File(["script"], "bad.html", { type: "text/html" }),
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", {
        type: "application/pdf",
      }),
    ])
      await expect(bookingsApi.uploadReceiptSlip(invalid)).rejects.toThrow();
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(receiptContentType({ name: "slip.jpeg", type: "", size: 20 })).toBe(
      "image/jpeg",
    );
  });
});
describe("receipt download and payment failures", () => {
  it("maps the real downloadUrl response to the receipt viewer", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      downloadUrl: uploadUrl,
      expiresIn: 900,
    });
    expect(await bookingsApi.getReceiptPresignedUrl("pay-1")).toEqual({
      url: uploadUrl,
    });
  });
  it("does not substitute a fake or expired cached URL on an API failure", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Receipt is missing"));
    await expect(bookingsApi.getReceiptPresignedUrl("pay-1")).rejects.toThrow(
      "Receipt is missing",
    );
  });
  it("does not fake a recorded or verified payment after a server failure", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error("Receipt missing"));
    vi.mocked(apiClient.patch).mockRejectedValue(
      new Error("Cannot verify receipt"),
    );
    await expect(
      bookingsApi.recordPayment("booking-1", {
        amount: 40000,
        method: "UPI",
        transactionRef: "UTR-123",
        receiptFileKey: "receipts/slip.png",
      }),
    ).rejects.toThrow("Receipt missing");
    await expect(
      bookingsApi.verifyPayment("pay-1", { status: "VERIFIED" }),
    ).rejects.toThrow("Cannot verify receipt");
  });
});

describe("live booking reads", () => {
  const payment = {
    id: "pay-1",
    bookingId: "bk-1",
    recordedById: "staff-1",
    amount: 40000,
    method: "UPI",
    transactionRef: "UTR-123",
    receiptFileKey: "receipts/slip.png",
    status: "PENDING",
    paymentDate: "2026-10-24",
    createdAt: "2026-10-24",
  };
  const summary = {
    id: "bk-1",
    bookingRef: "BK-2026-0001",
    leadId: "lead-1",
    quotationId: "quote-1",
    quoteNumber: "FLY-2026-0001",
    status: "CONFIRMED",
    totalAmount: 96000,
    paidAmount: 0,
    dueAmount: 96000,
    travelDate: "2026-12-20",
    createdAt: "2026-10-24",
    customerName: "Live Customer",
    customerPhone: "9876543210",
    serviceName: "Holidays",
    serviceSlug: "holidays",
    payments: [payment],
  };
  it("reads paginated API items and real pending receipts instead of demo/cached rows", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ items: [summary], totalPages: 2 })
      .mockResolvedValueOnce({
        items: [{ ...summary, id: "bk-2", bookingRef: "BK-2026-0002" }],
        totalPages: 2,
      });
    const rows = await bookingsApi.fetchBookings();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: "bk-1",
      customerName: "Live Customer",
      quotationNumber: "FLY-2026-0001",
      payments: [payment],
    });
    expect(apiClient.get).toHaveBeenCalledWith("/bookings?limit=100&page=2");
  });
  it("maps the backend detail response into the drawer's flat fields", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      ...summary,
      customer: {
        id: "c-1",
        fullName: "Live Customer",
        phone: "9876543210",
        city: "Kochi",
      },
      service: { id: "s-1", name: "Holidays", slug: "holidays" },
      quotation: {
        id: "quote-1",
        quoteNumber: "FLY-2026-0001",
        items: [],
        inclusions: [],
        exclusions: [],
      },
    });
    expect(await bookingsApi.fetchBookingById("bk-1")).toMatchObject({
      customerName: "Live Customer",
      customerCity: "Kochi",
      serviceName: "Holidays",
      payments: [payment],
    });
  });
  it("does not fabricate bookings or conversion success when the API is unavailable", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("API unavailable"));
    vi.mocked(apiClient.post).mockRejectedValue(new Error("Conversion failed"));
    await expect(bookingsApi.fetchBookings()).rejects.toThrow(
      "API unavailable",
    );
    await expect(
      bookingsApi.convertQuoteToBooking({
        quotationId: "quote-1",
        travelDate: "2026-12-20",
      }),
    ).rejects.toThrow("Conversion failed");
  });
});
