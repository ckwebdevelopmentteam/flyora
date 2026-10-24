import React, { useState } from "react";
import type { QuotationItemType, QuoteItemFormState } from "./types";
import { ITEM_TYPE_PRESETS } from "./types";
import {
  Plane,
  Building2,
  FileCheck2,
  Car,
  Compass,
  Tag,
  Trash2,
  Plus,
  Coins,
} from "lucide-react";

interface QuotationLineItemRepeaterProps {
  items: QuoteItemFormState[];
  onChange: (items: QuoteItemFormState[]) => void;
  defaultPaxCount?: number;
}

const CATEGORY_ICONS: Record<QuotationItemType, React.ElementType> = {
  FLIGHT: Plane,
  HOTEL: Building2,
  VISA: FileCheck2,
  TRANSFER: Car,
  ACTIVITY: Compass,
  OTHER: Tag,
};

const CATEGORY_BADGES: Record<
  QuotationItemType,
  { bg: string; text: string; border: string }
> = {
  FLIGHT: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  HOTEL: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  VISA: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  TRANSFER: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  ACTIVITY: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  OTHER: {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    border: "border-zinc-200",
  },
};

function QuantityInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (quantity: number) => void;
}) {
  const [isCleared, setIsCleared] = useState(false);

  return (
    <input
      id={id}
      type="number"
      min={1}
      step={1}
      value={isCleared ? "" : value}
      onChange={(event) => {
        const raw = event.target.value;
        // Keep the temporary blank in the input; quote data stays numeric.
        setIsCleared(raw === "");
        onChange(Math.max(1, parseInt(raw, 10) || 1));
      }}
      onBlur={() => setIsCleared(false)}
      className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
    />
  );
}

export const QuotationLineItemRepeater: React.FC<
  QuotationLineItemRepeaterProps
> = ({ items, onChange, defaultPaxCount = 1 }) => {
  const handleAddItem = (type: QuotationItemType = "OTHER") => {
    const preset = ITEM_TYPE_PRESETS[type];
    const newItem: QuoteItemFormState = {
      id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      type,
      title: preset ? preset.defaultTitle : "",
      description: preset ? preset.defaultDesc : "",
      quantity: Math.max(1, defaultPaxCount),
      supplierCost: 0,
      sellingPrice: 0,
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof QuoteItemFormState,
    value: any,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Repeater Header & Quick Shortcut Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-200/80">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-zinc-500" />
            Quotation Line Items ({items.length})
          </h4>
          <p className="text-[11px] text-zinc-500">
            Enter net supplier costs and quoted customer pricing for each
            service component.
          </p>
        </div>

        {/* Quick Add Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAddItem("FLIGHT")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/70 transition"
          >
            <Plane className="w-3 h-3" />
            <span>+ Flight</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddItem("HOTEL")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/70 transition"
          >
            <Building2 className="w-3 h-3" />
            <span>+ Hotel</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddItem("VISA")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/70 transition"
          >
            <FileCheck2 className="w-3 h-3" />
            <span>+ Visa</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddItem("TRANSFER")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 transition"
          >
            <Car className="w-3 h-3" />
            <span>+ Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddItem("ACTIVITY")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition"
          >
            <Compass className="w-3 h-3" />
            <span>+ Activity</span>
          </button>
        </div>
      </div>

      {/* Line Item Rows */}
      {items.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-300 bg-[#FAFAF9] space-y-2">
          <p className="text-xs text-zinc-500">
            No line items added yet. Click one of the shortcuts above to begin
            building the proposal.
          </p>
          <button
            type="button"
            onClick={() => handleAddItem("FLIGHT")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const Icon = CATEGORY_ICONS[item.type] || Tag;
            const badgeStyle =
              CATEGORY_BADGES[item.type] || CATEGORY_BADGES.OTHER;

            const unitCost = Number(item.supplierCost) || 0;
            const unitPrice = Number(item.sellingPrice) || 0;
            const qty = Math.max(1, Number(item.quantity) || 1);

            const rowCost = unitCost * qty;
            const rowPrice = unitPrice * qty;
            const rowProfit = rowPrice - rowCost;
            const rowMarginPercent =
              rowPrice > 0 ? (rowProfit / rowPrice) * 100 : 0;

            return (
              <div
                key={item.id || index}
                className="p-3.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all shadow-2xs space-y-3 group"
              >
                {/* Row Header: Category Selector, Title, and Delete Button */}
                <div className="flex items-start gap-2.5">
                  {/* Category Select */}
                  <div className="relative shrink-0">
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handleUpdateItem(
                          index,
                          "type",
                          e.target.value as QuotationItemType,
                        )
                      }
                      className={`text-xs font-medium px-2.5 py-1.5 pr-7 rounded-lg border appearance-none focus:outline-hidden focus:ring-1 focus:ring-black cursor-pointer ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      <option value="FLIGHT">Flight</option>
                      <option value="HOTEL">Hotel</option>
                      <option value="VISA">Visa</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="ACTIVITY">Activity</option>
                      <option value="OTHER">Custom</option>
                    </select>
                    <Icon className="w-3.5 h-3.5 absolute right-2 top-2 pointer-events-none opacity-60" />
                  </div>

                  {/* Title Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. Return Flights Indigo BOM-DXB"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateItem(index, "title", e.target.value)
                      }
                      className="w-full text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    aria-label={`Remove ${item.title || "item"}`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Details: e.g. 20kg check-in, 7kg cabin baggage, meals included"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdateItem(index, "description", e.target.value)
                    }
                    className="w-full text-[11px] px-3 py-1.5 rounded-lg border border-zinc-200 bg-[#FAFAF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
                  />
                </div>

                {/* Price, Cost, Qty, and Margin Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-zinc-100 items-end">
                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor={`quote-quantity-${item.id}`}
                      className="text-[10px] font-mono text-zinc-400 block mb-0.5"
                    >
                      Quantity (Pax / Units)
                    </label>
                    <QuantityInput
                      id={`quote-quantity-${item.id}`}
                      value={item.quantity}
                      onChange={(quantity) =>
                        handleUpdateItem(index, "quantity", quantity)
                      }
                    />
                  </div>

                  {/* Supplier Cost */}
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">
                      Unit Net Cost (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-zinc-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={item.supplierCost === 0 ? "" : item.supplierCost}
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            "supplierCost",
                            Math.max(0, parseFloat(e.target.value) || 0),
                          )
                        }
                        className="w-full text-xs font-mono pl-6 pr-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">
                      Unit Quoted Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-zinc-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={item.sellingPrice === 0 ? "" : item.sellingPrice}
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            "sellingPrice",
                            Math.max(0, parseFloat(e.target.value) || 0),
                          )
                        }
                        className="w-full text-xs font-mono pl-6 pr-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Live Mini Profit Badge */}
                  <div className="p-1.5 rounded-lg bg-[#F8F8F6] border border-zinc-200/60 text-right">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block">
                      Row Profit
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        rowProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {rowProfit >= 0 ? "+" : ""}₹
                      {Math.round(rowProfit).toLocaleString("en-IN")}{" "}
                      <span className="text-[10px] font-normal opacity-80">
                        ({rowMarginPercent.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Item Button at Bottom */}
      {items.length > 0 && (
        <button
          type="button"
          onClick={() => handleAddItem("OTHER")}
          className="w-full py-2 rounded-xl border border-dashed border-zinc-300 hover:border-black text-xs font-medium text-zinc-600 hover:text-black transition flex items-center justify-center gap-1.5 bg-[#FAFAF9]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Line Item</span>
        </button>
      )}
    </div>
  );
};
