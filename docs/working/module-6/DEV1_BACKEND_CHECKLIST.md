# Dev 1 (Backend) — Module 6 Implementation Checklist

**Role:** Backend Developer (Fastify, Prisma, PostgreSQL, Cloudflare R2, TypeScript, Zod)  
**Strict Boundaries:** ONLY touch `apps/api/`, `packages/database/`, `packages/types/src/booking.ts`, `packages/validators/src/bookingSchema.ts`.

---

## Step-by-Step Execution Plan

### Step 1: Base Contracts (Shared Types & Validators) — Publish FIRST (15 Mins)

- [ ] In `packages/types/src/booking.ts`:
  - Verify and expand `BookingStatus`: `"CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"`.
  - Verify `PaymentMethod`: `"BANK_TRANSFER_NEFT_IMPS" | "UPI" | "CREDIT_DEBIT_OFFLINE" | "CASH"`.
  - Verify `PaymentVerificationStatus`: `"PENDING" | "VERIFIED" | "REJECTED"`.
  - Add `BookingSummary` interface (for table lists).
  - Add `BookingDetails` interface (with customer, quotation items, and payment logs).
  - Add `PublicBookingView` interface (for customer trip voucher).
- [ ] In `packages/validators/src/bookingSchema.ts`:
  - Create `convertQuoteToBookingSchema`.
  - Create `recordPaymentSchema`.
  - Create `verifyPaymentSchema`.
  - Create `bookingFilterSchema`.
- [ ] Export in `packages/validators/src/index.ts` and verify with `npx tsc --noEmit`.
- [ ] Commit Step 1 so Dev 2 and Dev 3 can immediately import typed contracts.

---

### Step 2: Database Layer Verification

- [ ] Verify `Booking` and `Payment` models in `packages/database/prisma/schema.prisma`:
  - `Booking`: `id`, `bookingRef` (unique, format: `BK-YYYY-XXXX`), `leadId`, `quotationId`, `status`, `totalAmount`, `paidAmount`, `dueAmount`, `travelDate`, `createdAt`.
  - `Payment`: `id`, `bookingId`, `recordedById`, `amount`, `method`, `transactionRef`, `receiptFileKey`, `status`, `notes`, `paymentDate`, `createdAt`.
- [ ] Ensure Prisma Client is updated with `npm run generate --workspace=@flyora/database`.

---

### Step 3: Booking & Payment Service (`bookings.service.ts`)

- [ ] Create `apps/api/src/modules/bookings/bookings.service.ts`:
  - **Sequential Booking Ref Generator:** Generate `BK-2026-0001`, `BK-2026-0002`...
  - **`convertQuoteToBooking(userId, input)`:**
    1. Fetch quotation with lead and customer.
    2. Check that quotation is valid and not already converted.
    3. Run Prisma transaction:
       - Create `Booking` record (`status: "CONFIRMED"`, `totalAmount = quote.sellingPrice`, `paidAmount = 0`, `dueAmount = quote.sellingPrice`).
       - Update `Quotation.status = "ACCEPTED"`, `Quotation.acceptedAt = new Date()`.
       - Update `Lead.status = "BOOKED"`.
       - Log `LeadActivity`: `"BOOKING_CONFIRMED"`.
    4. Return created booking details.
  - **`getBookings(filters, userRole, userId)`:**
    - List bookings with pagination, status filter, and coordinator role filter.
  - **`getBookingById(id, userRole, userId)`:**
    - Return complete booking details with customer info, package/itinerary items, and payment logs.
  - **`recordPayment(userId, bookingId, input)`:**
    1. Fetch booking.
    2. Create `Payment` record with status `PENDING`.
    3. Return created payment record.
  - **`verifyPayment(userId, userRole, paymentId, input)`:**
    1. Role check: Admin or Accounts only.
    2. Update `Payment.status` to `VERIFIED` or `REJECTED`.
    3. If `VERIFIED`:
       - Recalculate total verified payments for booking: `paidAmount = sum(verified payments)`.
       - Recalculate `dueAmount = max(0, totalAmount - paidAmount)`.
       - Update booking record.
  - **`getReceiptPresignedUrl(paymentId, userRole)`:**
    1. Fetch payment receipt file key.
    2. Call `getPresignedDownloadUrl("flyora-private", receiptFileKey, 900)` (15-minute token).
    3. Return secure URL.
  - **`getPublicBooking(bookingRef)`:**
    - Customer trip voucher presentation: sanitized trip details, itinerary, payment summary, and coordinator contacts.

---

### Step 4: Fastify Booking & Payment Controller

- [ ] Create `apps/api/src/modules/bookings/bookings.controller.ts`:
  - `POST /api/v1/bookings/convert-quote` (Authenticated staff)
  - `GET /api/v1/bookings` (Authenticated staff)
  - `GET /api/v1/bookings/:id` (Authenticated staff)
  - `POST /api/v1/bookings/:id/payments` (Authenticated staff)
  - `PATCH /api/v1/payments/:id/verify` (Admin/Accounts only)
  - `GET /api/v1/payments/:id/receipt-url` (Admin/Accounts/Staff)
  - `GET /api/v1/public/bookings/:bookingRef` (Public, rate-limited)
- [ ] Register routes in `apps/api/src/server.ts`.

---

### Step 5: Verification & Automated Tests

- [ ] Create `apps/api/tests/booking.test.ts`:
  - Test booking reference generation format (`BK-YYYY-XXXX`).
  - Test balance calculation: `totalAmount - verifiedPayments = dueAmount`.
  - Test Zod validation schemas for payment recording and verification.
- [ ] Verify `npm run build --workspace=@flyora/api` passes with 0 errors.
