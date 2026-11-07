# Dev 1 (Backend) — Module 5 Implementation Checklist

**Role:** Backend Developer (Fastify, Prisma, TypeScript, Zod)  
**Strict Boundaries:** ONLY touch `apps/api/`, `packages/types/`, `packages/validators/`, `packages/database/`.

---

## Step-by-Step Execution Plan

### Step 1: Base Contracts (Shared Types & Validators) — Publish FIRST (15 Mins)

- [ ] Create `packages/types/src/quote.ts`:
  - `QuotationItemType` enum: `"FLIGHT" | "HOTEL" | "VISA" | "TRANSFER" | "ACTIVITY" | "OTHER"`.
  - `QuotationItem` interface (`id`, `type`, `title`, `description`, `quantity`, `supplierCost`, `sellingPrice`).
  - `QuotationSummary` interface.
  - `QuotationDetail` interface (full staff view).
  - `PublicQuotationView` interface (sanitized for client — NO `supplierCost`, NO `marginAmount`, NO `marginPercent`).
  - `MarginCheckResult` interface (`marginAmount`, `marginPercent`, `minMarginPercent`, `isHealthy`, `shortfallAmount`).
- [ ] Create `packages/validators/src/quoteSchema.ts`:
  - `createQuotationSchema` (Zod schema with item validation).
  - `updateQuotationStatusSchema` (`status` in `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`).
- [ ] Export both in `packages/types/src/index.ts` and `packages/validators/src/index.ts`.
- [ ] Commit Step 1 so Dev 2 and Dev 3 can immediately import typed contracts.

---

### Step 2: Database Layer Verification

- [ ] Confirm `Quotation` model in `packages/database/prisma/schema.prisma` matches the requirements:
  - `id`: UUID.
  - `leadId`: Relates to `Lead`.
  - `createdById`: Relates to `User`.
  - `quoteNumber`: String (unique, format: `FLY-YYYY-XXXX`).
  - `version`: Int default 1.
  - `status`: `QuoteStatus` enum (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`).
  - `shareToken`: String (unique, for public `/quote/[shareToken]`).
  - `supplierCost`: Decimal(10, 2).
  - `sellingPrice`: Decimal(10, 2).
  - `marginAmount`: Decimal(10, 2).
  - `marginPercent`: Float.
  - `items`: Json.
  - `inclusions`: String[].
  - `exclusions`: String[].
  - `validUntil`: DateTime.
  - `notes`: Text (internal notes for staff).
- [ ] Ensure Prisma client is up-to-date with `npm run generate --workspace=@flyora/database`.

---

### Step 3: Margin Guard Engine & Quotation Service

- [ ] Create `apps/api/src/modules/quotation/quotation.service.ts`:
  - **Sequential Quote Number Generator:** Generate `FLY-2026-0001`, `FLY-2026-0002`...
  - **Margin Calculator Helper:**
    ```typescript
    export function calculateQuotationMargins(
      items: QuotationItem[],
      minMarginPercent: number,
    ) {
      const supplierCost = items.reduce(
        (sum, item) => sum + item.supplierCost * item.quantity,
        0,
      );
      const sellingPrice = items.reduce(
        (sum, item) => sum + item.sellingPrice * item.quantity,
        0,
      );
      const marginAmount = sellingPrice - supplierCost;
      const marginPercent =
        sellingPrice > 0 ? (marginAmount / sellingPrice) * 100 : 0;
      const isHealthy = marginPercent >= minMarginPercent;

      // Calculate shortfall to hit required target
      const requiredPrice =
        minMarginPercent < 100
          ? supplierCost / (1 - minMarginPercent / 100)
          : supplierCost;
      const shortfallAmount = Math.max(0, requiredPrice - sellingPrice);

      return {
        supplierCost,
        sellingPrice,
        marginAmount,
        marginPercent,
        minMarginPercent,
        isHealthy,
        shortfallAmount,
      };
    }
    ```
  - **`createQuotation(userId: string, data: CreateQuotationInput)`:**
    1. Fetch lead with customer and service details.
    2. Check coordinator access (must be assigned coordinator or Super Admin / Operations Manager).
    3. Calculate totals & margins using `service.minMarginPercent`.
    4. Create `Quotation` record with unique `shareToken` and formatted `quoteNumber`.
    5. Update `lead.status` to `QUOTED`.
    6. Record `LeadActivity` log (`action: "QUOTATION_CREATED"`, `details: "Created quote ${quoteNumber} with total ₹${sellingPrice}"`).
  - **`getQuotationsByLead(leadId: string)`:**
    - List all quote versions created for that lead.
  - **`getQuotationById(id: string)`:**
    - Staff full view with items, margin breakdown, and customer details.
  - **`getPublicQuotation(shareToken: string)`:**
    - Find quote by `shareToken`.
    - Check if `validUntil < now()` $\to$ mark as expired if needed.
    - Return **strictly sanitized view**:
      - Quote number, validity date, customer name, destination / service title.
      - Items (title, description, quantity, quoted price) — **NO supplier costs!**
      - Inclusions, exclusions, total quoted package price.
      - Assigned coordinator contact name and phone/WhatsApp number.
  - **`updateQuotationStatus(id: string, status: QuoteStatus, userId: string)`:**
    - Update quote status and log `LeadActivity`.

---

### Step 4: Fastify Quotation Routes & Controller

- [ ] Create `apps/api/src/modules/quotation/quotation.controller.ts` and `quotation.routes.ts`:
  - `POST /api/v1/quotes` (Authenticated staff)
  - `GET /api/v1/quotes/lead/:leadId` (Authenticated staff)
  - `GET /api/v1/quotes/:id` (Authenticated staff)
  - `PATCH /api/v1/quotes/:id/status` (Authenticated staff)
  - `GET /api/v1/public/quotes/:shareToken` (Public, rate-limited)
- [ ] Register routes in `apps/api/src/server.ts`.

---

### Step 5: Verification & Tests

- [ ] Verify `npm run build --workspace=@flyora/api` passes with 0 TypeScript errors.
- [ ] Write integration test verifying:
  - Quotation creates correctly and updates lead status to `QUOTED`.
  - Margin Guard calculations are 100% accurate.
  - Public quote endpoint omits all sensitive cost and margin fields.
