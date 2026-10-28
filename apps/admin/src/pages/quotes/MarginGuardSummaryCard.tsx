import type { MarginCalculationResult } from "./types";
import { formatINR } from "../bookings/paymentCalculator";

export const MarginGuardSummaryCard = ({
  margin,
  serviceName,
}: {
  margin: MarginCalculationResult;
  serviceName: string;
}) => (
  <section className="surface p-5 space-y-4" aria-label="Price summary">
    <div className="flex justify-between items-center gap-3">
      <h3 className="font-semibold">Price summary</h3>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${margin.isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
      >
        {margin.isHealthy ? "Target met" : "Below target"}
      </span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        ["Supplier cost", formatINR(margin.totalSupplierCost)],
        ["Customer total", formatINR(margin.totalSellingPrice)],
        ["Your profit", formatINR(margin.grossMarginAmount)],
        ["Profit percentage", `${margin.marginPercent.toFixed(1)}%`],
      ].map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className="font-semibold text-base">{value}</p>
        </div>
      ))}
    </div>
    <p className="text-xs text-slate-500">
      Target profit for {serviceName}: {margin.minMarginPercent}%. Supplier
      costs and profit are only visible to your team.
    </p>
    {!margin.isHealthy && margin.shortfallAmount > 0 && (
      <p className="text-sm text-amber-800 bg-amber-50 rounded-md p-3">
        Increase the customer total by {formatINR(margin.shortfallAmount)} to
        meet the target.
      </p>
    )}
  </section>
);
