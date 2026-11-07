# Module 6: Booking Conversion & Offline Payment Tracking — 3-Developer Work Split

**Phase:** Phase 5 (Module 6)  
**Goal:** Implement the WhatsApp-first booking conversion workflow (1-click quote-to-booking), offline manual payment recording (NEFT/IMPS/UPI/Cash), Cloudflare R2 private bucket receipt upload & secure 15-minute presigned review URLs, automatic balance calculation (`dueAmount = totalAmount - verifiedPaidAmount`), payment verification for Admin/Accounts, and customer digital trip voucher presentation.

---

## 1. 🚨 Core Business Logic & Guardrails (Read Before Coding)

### 1.1 WhatsApp-First Booking Conversion (Zero Checkout Gates)

- **Real-World Reality:** Travel customers for high-value tour packages (₹50k - ₹3L) do **not** use self-service payment gateway checkouts.
- **Workflow:**
  1. Customer reviews their shareable quotation link (`/quote/[shareToken]`).
  2. Customer replies via WhatsApp or calls coordinator: _"Confirmed! Sending advance payment."_
  3. Coordinator opens the Quotation / Lead Drawer in Admin and clicks **"Convert to Booking"**.
  4. System advances `Quotation.status = ACCEPTED`, sets `Lead.status = BOOKED`, and generates a unique sequential booking reference: `BK-2026-0001`.
  5. The customer receives a permanent trip voucher link: `https://flyora.com/booking/BK-2026-0001`.

### 1.2 Offline Manual Payment Tracking & Cloudflare R2 Receipts

- **Methods:** `BANK_TRANSFER_NEFT_IMPS`, `UPI`, `CASH`, `CREDIT_DEBIT_OFFLINE`.
- **Payment Lifecycle:**
  - Staff / Coordinator enters payment: Amount (e.g. ₹40,000), Transaction Reference (Bank UTR / UPI ID), and uploads payment slip proof.
  - **Storage:** Receipt proof is uploaded directly to Cloudflare R2 **`flyora-private`** bucket. It is NEVER public.
  - **Status:** Initial payment status is `PENDING`.
  - **Admin / Accounts Verification:** Admin or Accounts checks the company bank statement, clicks "View Receipt" (opens a secure 15-minute presigned R2 download URL), and clicks **"Verify"** or **"Reject"**.
  - **Balance Math:**
    $$\text{paidAmount} = \sum \text{verified payments}$$
    $$\text{dueAmount} = \text{totalAmount} - \text{paidAmount}$$
    - If `dueAmount === 0`, status becomes `FULLY_PAID`.
    - If `dueAmount > 0` and `paidAmount > 0`, status is `PARTIALLY_PAID`.

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
│ DEV 1: BACKEND    │      │ DEV 2: ADMIN UI   │      │ DEV 3: WEB VOUCHER│
│ apps/api          │      │ apps/admin        │      │ apps/web          │
│ packages/database │      │ Bookings Table    │      │ /booking/[ref]    │
│ APIs & Payments   │      │ Payment Modal     │      │ WhatsApp Card     │
│ R2 Presigned URLs │      │ R2 Receipt Upload │      │ Print PDF Voucher │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

| Developer              | Strict Directory Boundaries                                                                                   | Files Never to Touch           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------ | :----------------------------- |
| **Dev 1 (Backend)**    | `apps/api/src/modules/bookings/`, `packages/types/src/booking.ts`, `packages/validators/src/bookingSchema.ts` | `apps/admin/**`, `apps/web/**` |
| **Dev 2 (Admin UI)**   | `apps/admin/src/pages/bookings/`, `apps/admin/src/pages/leads/components/`                                    | `apps/api/**`, `apps/web/**`   |
| **Dev 3 (Public Web)** | `apps/web/src/app/booking/`, `apps/web/src/components/booking/`                                               | `apps/api/**`, `apps/admin/**` |

---

## 3. Dependency & Waiting Matrix

| Task                                                         | Owner     | Waiting Developer | Action to Prevent Idling                                                                                                                                                   |
| :----------------------------------------------------------- | :-------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shared Contracts** (`booking.ts`, `bookingSchema.ts`)      | **Dev 1** | **Dev 2 & 3**     | Dev 1 pushes types first (~15 mins). Dev 2 & 3 build UI tables and voucher mock states immediately.                                                                        |
| **Booking Conversion API** (`POST /bookings/convert-quote`)  | **Dev 1** | **Dev 2**         | Dev 2 builds "Convert to Booking" modal and button in `LeadDetailDrawer.tsx` with optimistic mock state.                                                                   |
| **Payment Recording & Verification APIs**                    | **Dev 1** | **Dev 2**         | Dev 2 designs `RecordPaymentModal.tsx` and receipt file dropzone before wiring final API.                                                                                  |
| **Public Booking Voucher API** (`GET /public/bookings/:ref`) | **Dev 1** | **Dev 3**         | Dev 3 creates mock booking JSON and styles luxury voucher layout with print styles.                                                                                        |
| **Joint E2E Testing Gate**                                   | **All 3** | **None**          | Quote accepted $\to$ Convert to booking $\to$ Record UPI payment $\to$ Upload receipt to R2 $\to$ Admin verifies $\to$ Customer opens `/booking/[ref]` and prints voucher. |

---

## 4. Shared Contract Specifications

### 4.1 Zod Schemas (`@flyora/validators`)

```typescript
export const convertQuoteToBookingSchema = z.object({
  quotationId: z.string().uuid("Invalid quotation ID"),
  travelDate: z.string().min(1, "Travel date is required"),
  notes: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum([
    "BANK_TRANSFER_NEFT_IMPS",
    "UPI",
    "CREDIT_DEBIT_OFFLINE",
    "CASH",
  ]),
  transactionRef: z.string().min(3, "Transaction reference or UTR is required"),
  receiptFileKey: z.string().min(5, "Receipt proof file key is required"),
  notes: z.string().max(1000).optional(),
  paymentDate: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().max(1000).optional(),
});
```

---

## 5. Exit Criteria & PR Gate Checklist

- [ ] **Dev 1 (Backend):**
  - [ ] `POST /api/v1/bookings/convert-quote` creates `Booking`, generates sequential `BK-YYYY-XXXX`, updates `Lead` to `BOOKED`, marks `Quotation` as `ACCEPTED`.
  - [ ] `POST /api/v1/bookings/:id/payments` records payment with UTR and R2 private key.
  - [ ] `PATCH /api/v1/payments/:id/verify` (Admin/Accounts only) updates payment status and recalculates booking balance.
  - [ ] `GET /api/v1/payments/:id/receipt-url` returns 15-minute presigned download URL from `flyora-private`.
  - [ ] `GET /api/v1/public/bookings/:bookingRef` returns sanitized customer trip voucher details.
- [ ] **Dev 2 (Admin UI):**
  - [ ] Bookings table in `apps/admin` with stage filters and balance due badges.
  - [ ] "Convert to Booking" button in Quotation/Lead Drawer.
  - [ ] `RecordPaymentModal.tsx` with drag-and-drop receipt upload to R2 private bucket.
  - [ ] Payment verification actions for Admin/Accounts with in-modal receipt preview.
- [ ] **Dev 3 (Public Web):**
  - [ ] `/booking/[bookingRef]` public customer trip confirmation page.
  - [ ] Itemized itinerary, flight/hotel confirmation details, payment progress bar.
  - [ ] Print / Save PDF trip voucher with clean `@media print` styles.
  - [ ] Click-to-WhatsApp coordinator action.
- [ ] **Full Integration:** `npm run build` passes with 0 errors across all 3 packages.
