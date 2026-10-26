// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ReplaceReceiptButton } from "./ReplaceReceiptButton";
import { bookingsApi } from "./bookingsApi";
vi.mock("./bookingsApi", () => ({
  bookingsApi: { uploadReceiptSlip: vi.fn(), replacePaymentReceipt: vi.fn() },
}));
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
const receipt = () =>
  new File(["proof"], "corrected.png", { type: "image/png" });

it("replaces proof on the existing payment without recording another payment", async () => {
  vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
    fileKey: "receipts/corrected.png",
  });
  vi.mocked(bookingsApi.replacePaymentReceipt).mockResolvedValue();
  const replaced = vi.fn(),
    error = vi.fn();
  render(
    <ReplaceReceiptButton
      paymentId="existing-pay-1"
      transactionRef="UTR-123"
      onReplaced={replaced}
      onError={error}
    />,
  );
  fireEvent.change(screen.getByLabelText("Replace receipt for UTR-123"), {
    target: { files: [receipt()] },
  });
  await waitFor(() => expect(replaced).toHaveBeenCalledOnce());
  expect(bookingsApi.replacePaymentReceipt).toHaveBeenCalledExactlyOnceWith(
    "existing-pay-1",
    "receipts/corrected.png",
  );
});
it("does not replace proof or report success when uploading fails", async () => {
  vi.mocked(bookingsApi.uploadReceiptSlip).mockRejectedValue(
    new Error("Upload failed"),
  );
  const replaced = vi.fn(),
    error = vi.fn();
  render(
    <ReplaceReceiptButton
      paymentId="pay-1"
      transactionRef="UTR-123"
      onReplaced={replaced}
      onError={error}
    />,
  );
  const input = screen.getByLabelText(
    "Replace receipt for UTR-123",
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [receipt()] } });
  await waitFor(() =>
    expect(error).toHaveBeenCalledWith(expect.stringContaining("try again")),
  );
  expect(bookingsApi.replacePaymentReceipt).not.toHaveBeenCalled();
  expect(replaced).not.toHaveBeenCalled();
  expect(input.value).toBe("");
});
it("reports a status conflict without silently changing the payment", async () => {
  vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
    fileKey: "receipts/corrected.png",
  });
  vi.mocked(bookingsApi.replacePaymentReceipt).mockRejectedValue(
    new Error("Payment is no longer pending"),
  );
  const replaced = vi.fn(),
    error = vi.fn();
  render(
    <ReplaceReceiptButton
      paymentId="pay-1"
      transactionRef="UTR-123"
      onReplaced={replaced}
      onError={error}
    />,
  );
  fireEvent.change(screen.getByLabelText("Replace receipt for UTR-123"), {
    target: { files: [receipt()] },
  });
  await waitFor(() =>
    expect(error).toHaveBeenCalledWith(
      "Receipt replacement failed. Please try again.",
    ),
  );
  expect(replaced).not.toHaveBeenCalled();
});
