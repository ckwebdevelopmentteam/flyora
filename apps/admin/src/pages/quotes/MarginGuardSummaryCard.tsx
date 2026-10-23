import React from "react";
import type { MarginCalculationResult } from "./types";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
} from "lucide-react";

interface MarginGuardSummaryCardProps {
  margin: MarginCalculationResult;
  serviceName?: string;
  className?: string;
}

export const MarginGuardSummaryCard: React.FC<MarginGuardSummaryCardProps> = ({
  margin,
  serviceName,
  className = "",
}) => {
  const {
    totalSupplierCost,
    totalSellingPrice,
    grossMarginAmount,
    marginPercent,
    minMarginPercent,
    isHealthy,
    shortfallAmount,
  } = margin;

  const formatCurrency = (val: number) => {
    return "₹" + Math.round(val).toLocaleString("en-IN");
  };

  const deltaFromTarget = Number((marginPercent - minMarginPercent).toFixed(1));

  // Cap visualization for progress bar between 0 and 50%
  const visualMax = Math.max(40, minMarginPercent * 2);
  const fillPercent = Math.min(
    100,
    Math.max(0, (marginPercent / visualMax) * 100),
  );
  const targetMarkerPercent = Math.min(
    100,
    Math.max(0, (minMarginPercent / visualMax) * 100),
  );

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
        isHealthy
          ? "bg-white border-emerald-200/80 ring-1 ring-emerald-500/10"
          : totalSellingPrice === 0
            ? "bg-white border-zinc-200"
            : "bg-white border-rose-300 ring-1 ring-rose-500/20"
      } ${className}`}
    >
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-[#FAFAF9] border-b border-zinc-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isHealthy
                ? "bg-emerald-100 text-emerald-700"
                : totalSellingPrice === 0
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-rose-100 text-rose-700"
            }`}
          >
            {isHealthy ? (
              <ShieldCheck className="w-4 h-4" />
            ) : totalSellingPrice === 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              Margin Guard Engine
              <span className="text-[10px] font-mono font-normal lowercase px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600">
                min {minMarginPercent}%
              </span>
            </h3>
            {serviceName && (
              <p className="text-[11px] text-zinc-500 truncate max-w-xs">
                Enforcing floor rule for {serviceName}
              </p>
            )}
          </div>
        </div>

        {/* Live Badge */}
        {totalSellingPrice > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-mono ${
              isHealthy
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
            }`}
          >
            {isHealthy ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Healthy (
                  {deltaFromTarget >= 0
                    ? `+${deltaFromTarget}%`
                    : `${deltaFromTarget}%`}
                  )
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  Sub-Target ({marginPercent}% &lt; {minMarginPercent}%)
                </span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Numerical Metrics Grid */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Supplier Cost */}
          <div className="p-3 rounded-xl bg-[#F8F8F6] border border-zinc-200/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Supplier Net Cost
            </span>
            <p className="text-sm font-semibold font-mono text-zinc-800 mt-1">
              {formatCurrency(totalSupplierCost)}
            </p>
            <span className="text-[10px] text-zinc-400">Total payable</span>
          </div>

          {/* Quoted Price */}
          <div className="p-3 rounded-xl bg-[#F8F8F6] border border-zinc-200/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Quoted Price
            </span>
            <p className="text-sm font-semibold font-mono text-zinc-900 mt-1">
              {formatCurrency(totalSellingPrice)}
            </p>
            <span className="text-[10px] text-zinc-400">Client billable</span>
          </div>

          {/* Gross Margin */}
          <div className="p-3 rounded-xl bg-[#F8F8F6] border border-zinc-200/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Gross Profit
            </span>
            <p
              className={`text-sm font-semibold font-mono mt-1 ${
                grossMarginAmount >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {grossMarginAmount >= 0 ? "+" : ""}
              {formatCurrency(grossMarginAmount)}
            </p>
            <span className="text-[10px] text-zinc-400">Flyora profit</span>
          </div>

          {/* Margin Percentage */}
          <div
            className={`p-3 rounded-xl border ${
              isHealthy
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                : totalSellingPrice === 0
                  ? "bg-[#F8F8F6] border-zinc-200 text-zinc-700"
                  : "bg-rose-50/60 border-rose-200 text-rose-900"
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
              Net Margin %
            </span>
            <p className="text-base font-bold font-mono mt-0.5">
              {marginPercent.toFixed(1)}%
            </p>
            <span className="text-[10px] opacity-75">
              Target: {minMarginPercent}%
            </span>
          </div>
        </div>

        {/* Visual Progress / Target Gauge */}
        {totalSellingPrice > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>0%</span>
              <span className="text-zinc-700 font-medium">
                Floor: {minMarginPercent}%
              </span>
              <span>{visualMax}%+</span>
            </div>

            <div className="relative h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              {/* Target Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-zinc-700 z-10"
                style={{ left: `${targetMarkerPercent}%` }}
                title={`Minimum Target: ${minMarginPercent}%`}
              />

              {/* Current Margin Bar */}
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isHealthy ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Sub-target shortfall warning banner */}
        {!isHealthy && totalSellingPrice > 0 && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 flex items-start gap-2.5 text-xs animate-in fade-in duration-200"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-950">
                Margin Below Target ({marginPercent}% &lt; {minMarginPercent}%)
              </p>
              <p className="text-rose-800 leading-relaxed text-[11px]">
                Current selling price is below the required minimum threshold of{" "}
                <span className="font-semibold">{minMarginPercent}%</span>.
                {shortfallAmount > 0 && (
                  <>
                    {" "}
                    You need to increase the total package price by at least{" "}
                    <span className="font-semibold font-mono underline decoration-rose-400">
                      {formatCurrency(shortfallAmount)}
                    </span>{" "}
                    to meet profitability guardrails.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Healthy banner */}
        {isHealthy && (
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] leading-snug">
              <strong>Healthy Margin:</strong> Package pricing satisfies the
              minimum {minMarginPercent}% threshold. This quotation is ready for
              client proposal generation.
            </span>
          </div>
        )}

        {totalSellingPrice === 0 && (
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 flex items-center gap-2 text-xs">
            <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[11px]">
              Add quotation line items below to compute real-time margins.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
