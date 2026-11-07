import React, { useState } from "react";
import type { QuotationItemType, QuoteItemFormState } from "./types";
import {
  Plane,
  Building2,
  FileCheck2,
  Car,
  Compass,
  Tag,
  Trash2,
} from "lucide-react";

interface Props {
  items: QuoteItemFormState[];
  onChange: (items: QuoteItemFormState[]) => void;
  defaultPaxCount?: number;
}
const categories = [
  { type: "FLIGHT", label: "Flight", title: "Flight tickets", icon: Plane },
  { type: "HOTEL", label: "Hotel", title: "Hotel stay", icon: Building2 },
  { type: "VISA", label: "Visa", title: "Visa service", icon: FileCheck2 },
  { type: "TRANSFER", label: "Transfer", title: "Transfers", icon: Car },
  { type: "ACTIVITY", label: "Activity", title: "Activity", icon: Compass },
  { type: "OTHER", label: "Other", title: "Other service", icon: Tag },
] as const;
const units: Record<QuotationItemType, string> = {
  FLIGHT: "Match the quantity to the number of tickets you're pricing.",
  HOTEL:
    "Use 1 for a whole-stay price. For a nightly rate, use rooms × nights.",
  VISA: "Match the quantity to the number of applications you're pricing.",
  TRANSFER:
    "Match the quantity to the number of transfers or vehicles you're pricing.",
  ACTIVITY: "Match the quantity to the units in your supplier's price.",
  OTHER: "Use 1 if these prices cover the whole service or package.",
};
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
function QuantityInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (quantity: number) => void;
}) {
  const [cleared, setCleared] = useState(false);
  return (
    <input
      id={id}
      type="number"
      min={1}
      step={1}
      value={cleared ? "" : value}
      onChange={(event) => {
        setCleared(event.target.value === "");
        onChange(Math.max(1, parseInt(event.target.value, 10) || 1));
      }}
      onBlur={() => setCleared(false)}
    />
  );
}
export const QuotationLineItemRepeater: React.FC<Props> = ({
  items,
  onChange,
  defaultPaxCount = 1,
}) => {
  const add = (type: QuotationItemType) => {
    const preset = categories.find((category) => category.type === type)!;
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        type,
        title: preset.title,
        description: "",
        quantity:
          type === "FLIGHT" || type === "VISA"
            ? Math.max(1, defaultPaxCount)
            : 1,
        supplierCost: 0,
        sellingPrice: 0,
      },
    ]);
  };
  const update = (index: number, patch: Partial<QuoteItemFormState>) =>
    onChange(
      items.map((item, current) =>
        current === index ? { ...item, ...patch } : item,
      ),
    );
  return (
    <div className="quote-services">
      <div className="quote-services-heading">
        <div>
          <h3>
            Services <span>{items.length}</span>
          </h3>
        </div>
        <select
          className="quote-add-selector"
          aria-label="Add service"
          value=""
          onChange={(event) => add(event.target.value as QuotationItemType)}
        >
          <option value="" disabled>
            Add service
          </option>
          {categories.map((category) => (
            <option key={category.type} value={category.type}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
      {items.length === 0 && (
        <div className="notice">Choose “Add service” to start.</div>
      )}
      {items.map((item, index) => {
        const category =
          categories.find((category) => category.type === item.type) ||
          categories[5];
        const Icon = category.icon;
        const rowPrice = item.quantity * item.sellingPrice;
        const profit = rowPrice - item.quantity * item.supplierCost;
        const prefix = `quote-${item.id}`;
        return (
          <section
            className="quote-service-card"
            key={item.id}
            aria-label={`Service ${index + 1}`}
          >
            <header>
              <span className="quote-service-number">
                <Icon size={17} aria-hidden="true" />
                Service {index + 1}
              </span>
              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  onChange(items.filter((_, current) => current !== index))
                }
                aria-label={`Remove ${item.title || "item"}`}
              >
                <Trash2 size={17} />
              </button>
            </header>
            <div className="quote-service-fields">
              <div className="quote-service-title-grid">
                <div className="field">
                  <label htmlFor={`${prefix}-type`}>Service type</label>
                  <select
                    id={`${prefix}-type`}
                    aria-label={`Service category ${index + 1}`}
                    value={item.type}
                    onChange={(event) =>
                      update(index, {
                        type: event.target.value as QuotationItemType,
                      })
                    }
                  >
                    {categories.map((option) => (
                      <option key={option.type} value={option.type}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`${prefix}-name`}>Service name</label>
                  <input
                    id={`${prefix}-name`}
                    aria-label={`Service name ${index + 1}`}
                    placeholder="e.g. 3 nights at Marina Hotel"
                    value={item.title}
                    onChange={(event) =>
                      update(index, { title: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor={`${prefix}-details`}>
                  Details <span>(optional)</span>
                </label>
                <input
                  id={`${prefix}-details`}
                  aria-label={`Service details ${index + 1}`}
                  placeholder="Add the details the customer needs to know"
                  value={item.description}
                  onChange={(event) =>
                    update(index, { description: event.target.value })
                  }
                />
              </div>
              <div className="quote-pricing-grid">
                <div className="field">
                  <label htmlFor={`quote-quantity-${item.id}`}>Quantity</label>
                  <QuantityInput
                    id={`quote-quantity-${item.id}`}
                    value={item.quantity}
                    onChange={(quantity) => update(index, { quantity })}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`${prefix}-cost`}>
                    Supplier cost per unit (₹)
                  </label>
                  <input
                    id={`${prefix}-cost`}
                    aria-label={`Supplier cost per unit ${index + 1}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={item.supplierCost === 0 ? "" : item.supplierCost}
                    onChange={(event) =>
                      update(index, {
                        supplierCost: Math.max(
                          0,
                          parseFloat(event.target.value) || 0,
                        ),
                      })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor={`${prefix}-price`}>
                    Customer price per unit (₹)
                  </label>
                  <input
                    id={`${prefix}-price`}
                    aria-label={`Customer price per unit ${index + 1}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={item.sellingPrice === 0 ? "" : item.sellingPrice}
                    onChange={(event) =>
                      update(index, {
                        sellingPrice: Math.max(
                          0,
                          parseFloat(event.target.value) || 0,
                        ),
                      })
                    }
                  />
                </div>
              </div>
              <p className="quote-unit-hint">{units[item.type]}</p>
            </div>
            <footer>
              <span>
                Customer total <strong>{money.format(rowPrice)}</strong>
              </span>
              <span className={profit < 0 ? "quote-loss" : ""}>
                Estimated profit <strong>{money.format(profit)}</strong>
                {rowPrice > 0 && (
                  <small> ({((profit / rowPrice) * 100).toFixed(1)}%)</small>
                )}
              </span>
            </footer>
          </section>
        );
      })}
    </div>
  );
};
