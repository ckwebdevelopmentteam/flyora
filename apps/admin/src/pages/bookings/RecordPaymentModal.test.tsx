// @vitest-environment jsdom
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { bookingsApi } from "./bookingsApi";
import type { BookingRecord } from "./types";

vi.mock("./bookingsApi", () => ({
  bookingsApi: {
    recordPayment: vi.fn(),
    uploadReceiptSlip: vi.fn(),
  },
}));

const mockBooking: BookingRecord = {
  id: "bk-test-01",
  bookingRef: "BK-2026-0042",
  leadId: "lead-01",
  quotationId: "quote-01",
  status: "CONFIRMED",
  totalAmount: 180000,
  paidAmount: 60000,
  dueAmount: 120000,
  travelDate: "2026-11-20",
  createdAt: new Date().toISOString(),
  customerName: "Aamir & Priya Sheikh",
  customerPhone: "+91 98200 11223",
  serviceName: "Dubai Luxury Holidays",
};

const next = () =>
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
const enterDetails = () => {
  fireEvent.change(screen.getByLabelText("Amount received (₹)"), {
    target: { value: "40000" },
  });
  fireEvent.change(screen.getByLabelText("Payment reference / UTR number"), {
    target: { value: "UTR-123" },
  });
  next();
};
const receipt = () => new File(["proof"], "slip.png", { type: "image/png" });
const upload = async () => {
  fireEvent.change(screen.getByLabelText("Payment receipt"), {
    target: { files: [receipt()] },
  });
  await screen.findByText("slip.png");
};
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
const show = (onClose = vi.fn(), onPaymentRecorded = vi.fn()) =>
  render(
    <RecordPaymentModal
      isOpen
      booking={mockBooking}
      onClose={onClose}
      onPaymentRecorded={onPaymentRecorded}
    />,
  );

it("starts with the balance and allows a half-balance preset", () => {
  show();
  expect(screen.getByRole("dialog", { name: "Record payment" })).toBeTruthy();
  expect(screen.getByText("₹1,20,000")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Half balance" }));
  expect(
    (screen.getByLabelText("Amount received (₹)") as HTMLInputElement).value,
  ).toBe("60000");
  expect(screen.queryByLabelText("Payment receipt")).toBeNull();
});
it("blocks invalid details and requires a receipt before review", async () => {
  show();
  next();
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("reference"),
  );
  expect(bookingsApi.recordPayment).not.toHaveBeenCalled();
  enterDetails();
  next();
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("attach a payment receipt"),
  );
  expect(
    screen.queryByRole("button", { name: "Submit for verification" }),
  ).toBeNull();
});
it("keeps the entered details when navigating back", () => {
  show();
  enterDetails();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(
    (screen.getByLabelText("Amount received (₹)") as HTMLInputElement).value,
  ).toBe("40000");
  expect(
    (
      screen.getByLabelText(
        "Payment reference / UTR number",
      ) as HTMLInputElement
    ).value,
  ).toBe("UTR-123");
});
it("uploads proof, reviews the exact details and records one pending payment", async () => {
  vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
    fileKey: "receipts/slip.png",
  });
  vi.mocked(bookingsApi.recordPayment).mockResolvedValue({
    id: "pay-1",
    status: "PENDING",
  } as any);
  const close = vi.fn(),
    recorded = vi.fn();
  show(close, recorded);
  enterDetails();
  await upload();
  expect(bookingsApi.recordPayment).not.toHaveBeenCalled();
  next();
  expect(screen.getByText("₹40,000")).toBeTruthy();
  expect(screen.getByText(/balance changes only after/)).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Submit for verification" }),
  );
  await waitFor(() => expect(recorded).toHaveBeenCalledOnce());
  expect(bookingsApi.recordPayment).toHaveBeenCalledExactlyOnceWith(
    mockBooking.id,
    expect.objectContaining({
      amount: 40000,
      transactionRef: "UTR-123",
      receiptFileKey: "receipts/slip.png",
    }),
  );
  expect(close).toHaveBeenCalledOnce();
});
it("does not bypass review on Enter", () => {
  show();
  enterDetails();
  fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
  expect(bookingsApi.recordPayment).not.toHaveBeenCalled();
});
it("does not submit after upload failure, and allows the same file to be retried", async () => {
  vi.mocked(bookingsApi.uploadReceiptSlip)
    .mockRejectedValueOnce(new Error("R2 access denied: PRIVATE_CANARY"))
    .mockResolvedValueOnce({ fileKey: "receipts/slip.png" });
  show();
  enterDetails();
  const input = screen.getByLabelText("Payment receipt") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [receipt()] } });
  const error = await screen.findByRole("alert");
  expect(error.textContent).not.toContain("PRIVATE_CANARY");
  next();
  expect(bookingsApi.recordPayment).not.toHaveBeenCalled();
  expect(input.value).toBe("");
  await upload();
  expect(bookingsApi.uploadReceiptSlip).toHaveBeenCalledTimes(2);
});
it("rejects unsupported receipt files before making an upload request", async () => {
  show();
  enterDetails();
  fireEvent.change(screen.getByLabelText("Payment receipt"), {
    target: { files: [new File(["html"], "bad.html", { type: "text/html" })] },
  });
  expect((await screen.findByRole("alert")).textContent).toContain("PNG");
  expect(bookingsApi.uploadReceiptSlip).not.toHaveBeenCalled();
});
it("prevents double submission and preserves the form after a server failure", async () => {
  vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
    fileKey: "receipts/slip.png",
  });
  let reject!: (error: Error) => void;
  vi.mocked(bookingsApi.recordPayment).mockImplementation(
    () =>
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
  );
  const close = vi.fn();
  show(close);
  enterDetails();
  await upload();
  next();
  const form = screen.getByRole("dialog").querySelector("form")!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(bookingsApi.recordPayment).toHaveBeenCalledOnce();
  reject(new Error("Receipt is missing from storage"));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "upload it again",
  );
  expect(close).not.toHaveBeenCalled();
});
it("prevents closing while a receipt is uploading", async () => {
  let resolve!: (value: { fileKey: string }) => void;
  vi.mocked(bookingsApi.uploadReceiptSlip).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const close = vi.fn();
  show(close);
  enterDetails();
  fireEvent.change(screen.getByLabelText("Payment receipt"), {
    target: { files: [receipt()] },
  });
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).not.toHaveBeenCalled();
  resolve({ fileKey: "receipts/slip.png" });
  await screen.findByText("slip.png");
});
