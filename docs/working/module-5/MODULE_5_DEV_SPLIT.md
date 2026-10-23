# Module 5: Quotation Builder & Margin Guard — 3-Developer Work Split

**Phase:** Phase 4 (Module 5)  
**Goal:** Implement manual rates quotation builder (Flights, Hotels, Visas, Transfers), real-time Margin Guard enforcement (`minMarginPercent`), unique public token generation (`/quote/[shareToken]`), customer proposal presentation page on `apps/web`, and Click-to-WhatsApp proposal dispatch.

---

## 1. 🚨 Core Business Logic & Guardrails (Read Before Coding)

### 1.1 Zero Live Supplier Pricing Feeds (Manual Offline Workflow)

- **Real-World Reality:** Flyora does **NOT** use GDS/Amadeus/Booking.com live ticket APIs.
- **Workflow:**
  1. The assigned service coordinator receives/claims the lead.
  2. The coordinator checks offline partner portals or contacts suppliers via WhatsApp/Phone to obtain exact net supplier rates.
  3. The coordinator opens the **Quotation Builder** in the Admin portal and enters line items with two crucial pricing columns:
     - **Supplier Cost (Net):** What Flyora pays to the hotel/airline/partner.
     - **Selling Price (Gross):** What the client is charged.

### 1.2 The Margin Guard Formula

$$\text{Total Supplier Cost} = \sum \text{Item Supplier Cost}$$
$$\text{Total Selling Price} = \sum \text{Item Selling Price}$$
$$\text{Margin Amount} = \text{Total Selling Price} - \text{Total Supplier Cost}$$
$$\text{Margin \%} = \left(\frac{\text{Margin Amount}}{\text{Total Selling Price}}\right) \times 100$$

- **Floor Protection:** Each Service has a `minMarginPercent` (e.g. Holidays: 12%, Visas: 20%, Flights: 5%, Umrah: 15%).
- **UI Behavior:**
  - 🟢 **Healthy Margin ($\ge$ target):** Displayed in emerald green with "Healthy Margin" badge. Coordinator can generate and send immediately.
  - 🔴 / 🟡 **Sub-Target Margin (< target):** Displayed in amber/red with explicit warning: _"Margin is below minimum threshold of X%. Selling price must be at least ₹YY,YYY to meet target."_ Prevents coordinators from accidentally booking at a loss.

### 1.3 🛑 Critical Security Rule: Zero Internal Cost Leakage

- **Customer Must NEVER See:** `supplierCost`, `marginAmount`, `marginPercent`, or internal notes in public API responses, DOM markup, or JSON payloads.
- **Public Endpoint Sanity:** `GET /public/quotes/:shareToken` must strip all cost/margin fields before returning data to `apps/web`.

---

## 2. Strict Developer Boundaries (Zero Merge Conflicts)

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 0: Base Contracts (Dev 1 publishes FIRST — 15 mins)               │
│ Shared Types (@flyora/types) + Zod Schemas (@flyora/validators)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│ DEV 1: BACKEND    │      │ DEV 2: ADMIN UI   │      │ DEV 3: WEB QUOTE  │
│ apps/api          │      │ apps/admin        │      │ apps/web          │
│ packages/database │      │ Quotation Builder │      │ /quote/[token]    │
│ APIs & Guard Calc │      │ Margin Guard Bar  │      │ WhatsApp Card     │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

| Developer              | Strict Directory Boundaries                                                                                                      | Files Never to Touch           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :----------------------------- |
| **Dev 1 (Backend)**    | `apps/api/src/modules/quotation/`, `packages/database/`, `packages/types/src/quote.ts`, `packages/validators/src/quoteSchema.ts` | `apps/admin/**`, `apps/web/**` |
| **Dev 2 (Admin UI)**   | `apps/admin/src/pages/quotes/`, `apps/admin/src/pages/leads/components/LeadDetailDrawer.tsx`                                     | `apps/api/**`, `apps/web/**`   |
| **Dev 3 (Public Web)** | `apps/web/src/app/quote/`, `apps/web/src/components/quote/`                                                                      | `apps/api/**`, `apps/admin/**` |

---

## 3. Dependency & Waiting Matrix

| Task                                                | Owner     | Waiting Developer | Action to Prevent Sitting Idle                                                                                                                                     |
| :-------------------------------------------------- | :-------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shared Contracts** (`quote.ts`, `quoteSchema.ts`) | **Dev 1** | **Dev 2 & 3**     | Dev 1 pushes types first (~15 mins). Dev 2 & 3 can immediately build UI layouts with agreed TypeScript interfaces.                                                 |
| **Quotation Creation API** (`POST /quotes`)         | **Dev 1** | **Dev 2**         | Dev 2 builds dynamic item rows and live client-side margin calculator using local component state before connecting API.                                           |
| **Public Quote API** (`GET /public/quotes/:token`)  | **Dev 1** | **Dev 3**         | Dev 3 creates mock quote JSON in `apps/web` and builds the responsive customer presentation view.                                                                  |
| **Full E2E Integration Gate**                       | **All 3** | **None**          | Lead $\to$ Click "Create Quote" $\to$ Enter items $\to$ Margin check passes $\to$ Copy share link $\to$ Customer opens link on web $\to$ Customer clicks WhatsApp. |

---

## 4. Shared Contract Specifications

### 4.1 Quotation Item Shape (Stored as JSON in `Quotation.items`)

```typescript
export type QuotationItemType =
  "FLIGHT" | "HOTEL" | "VISA" | "TRANSFER" | "ACTIVITY" | "OTHER";

export interface QuotationItem {
  id: string;
  type: QuotationItemType;
  title: string; // e.g. "Indigo Return Flights (BOM-DXB)"
  description?: string; // e.g. "20kg check-in, 7kg cabin baggage included"
  quantity: number; // e.g. 2 adults
  supplierCost: number; // e.g. 24000 (Flyora net cost)
  sellingPrice: number; // e.g. 28000 (Quoted to customer)
}
```

### 4.2 Shared Input Validator (`@flyora/validators`)

```typescript
export const createQuotationSchema = z.object({
  leadId: z.string().uuid(),
  validUntil: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  items: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "FLIGHT",
          "HOTEL",
          "VISA",
          "TRANSFER",
          "ACTIVITY",
          "OTHER",
        ]),
        title: z.string().min(2, "Item title required"),
        description: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        supplierCost: z.number().nonnegative(),
        sellingPrice: z.number().positive(),
      }),
    )
    .min(1, "At least one quotation item is required"),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
});
```

---

## 5. Exit Criteria & PR Gate Checklist

- [ ] **Dev 1 (Backend):**
  - [ ] `POST /api/v1/quotes` validates items, calculates totals and margin %, enforces lead ownership/role checks.
  - [ ] `GET /api/v1/quotes/:id` returns full quotation details for staff.
  - [ ] `GET /api/v1/quotes/lead/:leadId` lists all versions/quotes for a lead.
  - [ ] `GET /api/v1/public/quotes/:shareToken` serves sanitized client view with zero supplier cost fields.
  - [ ] `PATCH /api/v1/quotes/:id/status` updates quote status (`SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`).
- [ ] **Dev 2 (Admin UI):**
  - [ ] "Create Quotation" button in `LeadDetailDrawer.tsx` opens Quotation Builder with pre-filled lead data.
  - [ ] Dynamic repeater for adding/removing Flight, Hotel, Visa, Transfer line items.
  - [ ] Real-time Margin Guard bar updates dynamically on every keystroke.
  - [ ] Warning banner displayed when margin % falls below service target.
  - [ ] Success modal displays shareable link and "Copy WhatsApp Message" button.
- [ ] **Dev 3 (Public Web):**
  - [ ] `/quote/[token]` loads quote, handling loading, expired, and not found states.
  - [ ] Responsive, modern customer proposal layout with itinerary cards and inclusion pills.
  - [ ] Pre-formatted WhatsApp button opens chat with coordinator containing quote reference.
  - [ ] Print / PDF layout optimized (`@media print`).
- [ ] **Integration:** `npm run build` passes with 0 errors across all 3 packages.
