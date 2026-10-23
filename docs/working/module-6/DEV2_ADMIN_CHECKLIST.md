# Dev 2 (Admin UI) — Module 6 Implementation Checklist

**Role:** Admin Frontend Developer (React, Vite, TypeScript, Tailwind CSS, TanStack Query)  
**Strict Boundaries:** ONLY touch `apps/admin/src/pages/bookings/`, `apps/admin/src/pages/leads/components/`, `apps/admin/src/pages/quotes/`. NEVER touch `apps/api/` or `apps/web/`.

---

## Step-by-Step Execution Plan

### Step 1: "Convert to Booking" Action

- [ ] In `apps/admin/src/pages/leads/components/LeadDetailDrawer.tsx` and Quote details:
  - Add **"Convert to Booking"** button for accepted quotes.
  - Open `ConvertBookingModal.tsx`:
    - Display Quote summary (Total Selling Price, Destination, Client name).
    - Travel Date picker (defaults to lead travel date).
    - Internal Booking Notes input.
    - Submit button calls `POST /api/v1/bookings/convert-quote`.
  - On success:
    - Show green confirmation toast: _"🎉 Booking BK-2026-XXXX confirmed!"_
    - Lead status badge updates to `BOOKED`.

---

### Step 2: Bookings Management Dashboard

- [ ] Create `apps/admin/src/pages/bookings/BookingsPage.tsx`:
  - **Filter Tabs:** `All`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`.
  - **Payment Status Filter:** `All`, `Pending Advance`, `Partially Paid`, `Fully Paid`.
  - **TanStack Table Columns:**
    - Booking Ref (e.g. `BK-2026-0042`) with badge.
    - Customer Name & Phone.
    - Service / Destination.
    - Travel Date.
    - Total Package Price (₹).
    - Paid Amount (₹) & Due Balance (₹) with progress indicator.
    - Status badge.
    - Action buttons: "View Details", "Record Payment".

---

### Step 3: Record Offline Payment Modal (`RecordPaymentModal.tsx`)

- [ ] Build modal to log offline payments:
  - Display Booking reference and current Due Balance: `₹XX,XXX`.
  - Input fields:
    - **Amount (₹):** Number input (defaults to remaining due amount).
    - **Payment Method:** Dropdown (`UPI`, `Bank Transfer (NEFT/IMPS)`, `Cash`, `Card`).
    - **Transaction Reference / UTR:** Text input (e.g. `UPI/5283918239` or bank UTR).
    - **Payment Date:** Date picker (defaults to today).
    - **Receipt Slip Uploader:** File dropzone (PDF, PNG, JPG).
      - Step A: Request presigned upload URL from `POST /api/v1/storage/upload-url` with `bucketType: "private"` and `folder: "receipts"`.
      - Step B: Upload file directly to Cloudflare R2 `flyora-private`.
      - Step C: Send `receiptFileKey` in `POST /api/v1/bookings/:id/payments`.
    - **Internal Notes:** Optional text area.

---

### Step 4: Booking Details & Payment Verification Drawer

- [ ] Create `BookingDetailDrawer.tsx`:
  - **Section 1: Trip & Passenger Overview:**
    - Lead Passenger, Contact info, Travel Dates, Itinerary items list.
  - **Section 2: Financial Summary:**
    - Total Package Amount: `₹XX,XXX`.
    - Total Verified Paid: `₹XX,XXX`.
    - Outstanding Balance Due: `₹XX,XXX`.
  - **Section 3: Payment History & Verification (Admin / Accounts):**
    - List of recorded payments:
      - Date, Method, Amount, UTR.
      - Status pill: `PENDING` (yellow), `VERIFIED` (green), `REJECTED` (red).
      - "View Receipt Proof" button: calls `GET /api/v1/payments/:id/receipt-url` and opens presigned image/PDF in modal.
      - **Verification Buttons (Admin/Accounts only):**
        - Green "Verify Payment" button $\to$ calls `PATCH /api/v1/payments/:id/verify` with `{ status: "VERIFIED" }`.
        - Red "Reject Payment" button.

---

### Step 5: Verification & Tests

- [ ] Run `npm run test` in `apps/admin`.
- [ ] Run `npm run build --workspace=@flyora/admin` to confirm 0 TypeScript / Vite build errors.
