import { useRef, useState } from "react";
import { bookingsApi } from "./bookingsApi";

export function ReplaceReceiptButton({
  paymentId,
  transactionRef,
  onReplaced,
  onError,
}: {
  paymentId: string;
  transactionRef: string;
  onReplaced?: () => void;
  onError: (message: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        aria-label={`Replace receipt for ${transactionRef}`}
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file || uploading.current) return;
          uploading.current = true;
          setBusy(true);
          onError(null);
          try {
            const receipt = await bookingsApi.uploadReceiptSlip(file);
            await bookingsApi.replacePaymentReceipt(paymentId, receipt.fileKey);
            onReplaced?.();
          } catch (error) {
            onError(
              error instanceof Error
                ? error.message
                : "Receipt replacement failed. Please try again.",
            );
          } finally {
            uploading.current = false;
            setBusy(false);
            if (input.current) input.current.value = "";
          }
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="rounded px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
      >
        {busy ? "Uploading receipt…" : "Replace Receipt"}
      </button>
    </>
  );
}
