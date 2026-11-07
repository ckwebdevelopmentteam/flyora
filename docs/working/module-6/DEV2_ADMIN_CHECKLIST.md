# Dev 2 (Admin UI) — Module 6 Implementation Checklist

**Role:** Admin Frontend Developer (React, Vite, TypeScript, Tailwind CSS, TanStack Query)  
**Strict Boundaries:** ONLY touch `apps/admin/src/pages/bookings/`, `apps/admin/src/pages/leads/components/`, `apps/admin/src/components/layout/Sidebar.tsx`, `apps/admin/src/App.tsx`, and `docs/working/module-6/DEV2_ADMIN_CHECKLIST.md`. NEVER touch `apps/api/` or `apps/web/`.

---

## Architecture & Design Standard

- **Design Tokens:** Tailwind CSS with `#F8F8F6` canvas, rich neutral borders, subtle glassmorphism, emerald success states, amber alert states, and sleek monospace typography for references and financial figures.
- **State Management:** Decoupled API service layer (`bookingsApi.ts`), pure calculation engine (`paymentCalculator.ts`), and TanStack Query with optimistic cache invalidation.
- **Testing:** Vitest + React Testing Library unit, component, and E2E workflow tests.

---

## Brick-by-Brick Execution Plan

### Brick 1: Types & Pure Calculation Engine

- [x] Create `apps/admin/src/pages/bookings/types.ts`:
  - Full TypeScript types for `BookingRecord`, `PaymentRecord`, `BookingStatus`, `PaymentMethod`, `PaymentVerificationStatus`.
  - Conversion payload and payment recording payload interfaces.
- [x] Create `apps/admin/src/pages/bookings/paymentCalculator.ts`:
  - `calculateBookingFinancials({ totalAmount, payments })`:
    - Computes `verifiedPaidAmount`, `pendingAmount`, `dueAmount`, `progressPercent`, and `paymentStatus` (`FULLY_PAID`, `PARTIALLY_PAID`, `PENDING_VERIFICATION`, `UNPAID`).
- [x] Create `apps/admin/src/pages/bookings/paymentCalculator.test.ts`:
  - 100% test coverage for partial payments, full payment, zero payment, pending verifications, and rejected payments.

### Brick 2: API Client Layer (`bookingsApi.ts`)

- [x] Create `apps/admin/src/pages/bookings/bookingsApi.ts`:
  - `fetchBookings(filters)`: `GET /api/v1/bookings`
  - `fetchBookingById(id)`: `GET /api/v1/bookings/:id`
  - `convertQuoteToBooking(payload)`: `POST /api/v1/bookings/convert-quote`
  - `recordPayment(bookingId, payload)`: `POST /api/v1/bookings/:id/payments`
  - `verifyPayment(paymentId, payload)`: `PATCH /api/v1/payments/:id/verify`
  - `getReceiptPresignedUrl(paymentId)`: `GET /api/v1/payments/:id/receipt-url`
  - `requestReceiptUploadUrl(fileName, contentType)`: `POST /api/v1/storage/upload-url` (with private bucket)

### Brick 3: "Convert to Booking" Modal & Lead Drawer Integration

- [x] Create `apps/admin/src/pages/bookings/ConvertBookingModal.tsx`:
  - Quote summary card (Quote Number, Service/Package, Customer Name, Selling Price, Pax).
  - Travel Date picker (pre-filled with `lead.travelDate`).
  - Coordinator Internal Notes.
  - One-click confirmation with loading states.
  - Success state with Booking Reference (`BK-2026-XXXX`), public voucher link (`/booking/BK-...`), Copy Link, and direct WhatsApp trip confirmation dispatch.
- [x] Integrate into `apps/admin/src/pages/leads/components/LeadDetailDrawer.tsx`:
  - Add prominent **"Convert to Booking"** button in Quote cards.
  - Auto-update lead pipeline status to `BOOKED` on successful conversion.

### Brick 4: Record Offline Payment Modal (`RecordPaymentModal.tsx`)

- [x] Create `apps/admin/src/pages/bookings/RecordPaymentModal.tsx`:
  - Booking & Customer financial summary header with remaining due amount.
  - 1-click preset shortcuts: "Full Due Amount", "50% Advance", "₹25,000 Advance".
  - Amount input with validation against remaining due.
  - Payment Method dropdown (`UPI`, `BANK_TRANSFER_NEFT_IMPS`, `CASH`, `CREDIT_DEBIT_OFFLINE`).
  - UTR / Transaction Reference input.
  - Payment Date picker (defaults to today).
  - Drag-and-drop Receipt Proof Slip Uploader (PDF, PNG, JPG):
    - File validation & upload progress.
    - Presigned URL integration to Cloudflare R2 private bucket.
  - Internal payment notes.

### Brick 5: Booking Details & Accounts Verification Drawer (`BookingDetailDrawer.tsx`)

- [x] Create `apps/admin/src/pages/bookings/BookingDetailDrawer.tsx`:
  - **Header:** Booking Ref pill, customer name, phone, quick Call & WhatsApp buttons, Trip Voucher link.
  - **Financial Summary Gauge:** Quoted Price, Verified Paid, Outstanding Due, visual progress meter.
  - **Trip Details Card:** Destination, travel dates, passenger count, coordinator notes.
  - **Payment History Feed:**
    - List of all recorded payments with date, method, amount, UTR.
    - Status badges: `PENDING` (amber), `VERIFIED` (emerald), `REJECTED` (rose).
    - "View Receipt Proof" modal (opens presigned R2 image/PDF).
    - **Accounts / Admin Verification Bar:**
      - "Verify Payment" button (`PATCH /payments/:id/verify`).
      - "Reject Payment" button with reason prompt.
  - **Quick Action Buttons:** "Record Additional Payment", "Resend Trip Voucher WhatsApp".

### Brick 6: Bookings Dashboard Table & Navigation (`BookingsPage.tsx`)

- [x] Create `apps/admin/src/pages/bookings/BookingsPage.tsx`:
  - Executive financial metrics summary cards (Total Bookings, Total Quoted, Paid Amount, Balance Due).
  - Status filter tabs (`All`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`).
  - Payment filter tabs (`All`, `Unpaid`, `Partially Paid`, `Fully Paid`, `Review Needed`).
  - Search input (by Booking Ref, Customer Name, Phone, Service).
  - Interactive Table with status badges, progress bars, and drawer openers.
- [x] Update `apps/admin/src/App.tsx`:
  - Register `/bookings` route inside `AdminLayout`.
- [x] Update `apps/admin/src/components/layout/Sidebar.tsx`:
  - Activate "Bookings & Payments" navigation item with live `/bookings` link.

### Brick 7: Comprehensive Test Suite & Verification

- [x] `paymentCalculator.test.ts` (Unit tests)
- [x] `ConvertBookingModal.test.tsx` (Component tests)
- [x] `RecordPaymentModal.test.tsx` (Component tests)
- [x] `BookingDetailDrawer.test.tsx` (Component tests)
- [x] `BookingsPage.test.tsx` (Component tests)
- [x] `bookingE2E.test.tsx` (End-to-end integration workflow)
- [x] Run `npm run test:module6 --workspace=@flyora/admin`
- [x] Run `npm run build --workspace=@flyora/admin` to confirm 0 TypeScript / Vite build errors.
