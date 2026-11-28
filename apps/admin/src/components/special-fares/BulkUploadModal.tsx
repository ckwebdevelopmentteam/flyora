import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, FormError } from "../ui/Modal";
import { specialFaresApi } from "../../lib/specialFaresApi";
import { userMessage } from "../../lib/userMessage";
import {
  parseSpecialFareSheet,
  SAMPLE_SPECIAL_FARES_CSV,
} from "./bulkSheetParser";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const queryClient = useQueryClient();
  const [sheetText, setSheetText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSmoothClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      return;
    }
    setIsClosing(false);
    setSubmitError(null);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const parsedRows = useMemo(
    () => (sheetText.trim() ? parseSpecialFareSheet(sheetText) : []),
    [sheetText],
  );

  const validItems = useMemo(
    () => parsedRows.filter((r) => r.valid && r.data).map((r) => r.data!),
    [parsedRows],
  );

  const invalidCount = parsedRows.length - validItems.length;

  const mutation = useMutation({
    mutationFn: () => specialFaresApi.bulkCreateSpecialFares(validItems),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["special-fares"] });
      setSheetText("");
      setFileName(null);
      onSuccess(
        `${res.createdCount} special fare allotment(s) imported successfully.`,
      );
      handleSmoothClose();
    },
    onError: (err: any) => {
      setSubmitError(
        userMessage(
          err,
          "Could not import sheet rows. Please review the data.",
        ),
      );
    },
  });

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_SPECIAL_FARES_CSV], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flyora-special-fares-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSheetText(String(reader.result || ""));
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <Modal
      wide
      closing={isClosing}
      panelClassName="max-w-[900px]"
      busy={mutation.isPending}
      title="Bulk Upload Special Fare Sheet"
      description="Upload a CSV exported from Excel/Riya or paste spreadsheet rows directly. All rows are validated before publishing."
      onClose={handleSmoothClose}
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="text-xs text-zinc-500">
            {parsedRows.length > 0 && (
              <span>
                <strong className="text-emerald-700">
                  {validItems.length}
                </strong>{" "}
                ready ·{" "}
                <strong className="text-rose-600">{invalidCount}</strong>{" "}
                error(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={mutation.isPending || isClosing}
              onClick={handleSmoothClose}
              className="button-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                validItems.length === 0 || mutation.isPending || isClosing
              }
              onClick={() => mutation.mutate()}
              className="button-primary cursor-pointer disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>
                Publish {validItems.length > 0 ? validItems.length : ""}{" "}
                Allotment{validItems.length === 1 ? "" : "s"}
              </span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <FormError>{submitError}</FormError>

        {/* Action Toolbar: Upload File + Template */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#002f89] hover:bg-[#00246b] text-white text-xs font-medium cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Choose CSV / TSV File</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {fileName && (
            <div className="inline-flex items-center gap-2 text-xs text-zinc-700 bg-white px-2.5 py-1.5 rounded-md border border-zinc-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium truncate max-w-[180px]">
                {fileName}
              </span>
              <button
                type="button"
                aria-label="Clear sheet"
                onClick={() => {
                  setFileName(null);
                  setSheetText("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-zinc-400 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Paste Area */}
        <div className="field">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="sf-bulk-paste">
              Or Paste Rows Directly from Excel / Google Sheets
            </label>
            <button
              type="button"
              onClick={() => {
                setFileName("sample-preview.csv");
                setSheetText(SAMPLE_SPECIAL_FARES_CSV);
              }}
              className="text-[11px] font-medium text-blue-700 hover:underline cursor-pointer"
            >
              Load Sample Rows
            </button>
          </div>
          <textarea
            id="sf-bulk-paste"
            rows={5}
            value={sheetText}
            onChange={(e) => setSheetText(e.target.value)}
            placeholder="Paste spreadsheet table including the header row (e.g. airlineName, flightNumber, originCode, destinationCode, departureDate, departureTime, farePerSeat, childFare, infantFare, totalSeats, isRefundable)..."
            className="w-full font-mono text-[11px] leading-relaxed p-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Live Validation Preview Table */}
        {parsedRows.length > 0 && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">
                Sheet Preview ({parsedRows.length} rows detected, max 100 per
                upload)
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500">
                    <th className="py-2 px-3">Row</th>
                    <th className="py-2 px-3">Route & Airline</th>
                    <th className="py-2 px-3">Schedule</th>
                    <th className="py-2 px-3">Fares (A / C / I)</th>
                    <th className="py-2 px-3">Seats / Class</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {parsedRows.slice(0, 100).map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={row.valid ? "bg-white" : "bg-rose-50/60"}
                    >
                      <td className="py-2 px-3 font-mono text-zinc-500">
                        #{row.rowNumber}
                      </td>
                      <td className="py-2 px-3 font-medium text-zinc-900">
                        {row.data ? (
                          <div>
                            <span>
                              {row.data.originCode} ➔ {row.data.destinationCode}
                            </span>
                            <div className="text-[11px] text-zinc-500 font-normal">
                              {row.data.airlineName}{" "}
                              {row.data.flightNumber
                                ? `(${row.data.flightNumber})`
                                : ""}
                            </div>
                          </div>
                        ) : (
                          row.rawSummary
                        )}
                      </td>
                      <td className="py-2 px-3 text-zinc-600">
                        {row.data ? (
                          <div>
                            {new Date(row.data.departureDate).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3 text-zinc-700 font-medium">
                        {row.data ? (
                          <div>
                            <span>
                              ₹{row.data.farePerSeat.toLocaleString("en-IN")}
                            </span>
                            {(row.data.childFare || row.data.infantFare) && (
                              <div className="text-[10px] text-zinc-500 font-normal">
                                C:{" "}
                                {row.data.childFare != null
                                  ? `₹${row.data.childFare}`
                                  : "—"}{" "}
                                · I:{" "}
                                {row.data.infantFare != null
                                  ? `₹${row.data.infantFare}`
                                  : "—"}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3 text-zinc-600">
                        {row.data ? (
                          <div>
                            <span>{row.data.totalSeats} seats</span>
                            <div className="text-[10px] text-zinc-500">
                              {row.data.cabinClass} ·{" "}
                              {row.data.isRefundable ? "Refundable" : "Non-Ref"}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </span>
                        ) : (
                          <div className="inline-flex items-start gap-1 text-rose-700 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{row.errors.join("; ")}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
