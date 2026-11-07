# Dev 3 (Public Web) — Module 6 Implementation Checklist

**Role:** Public Web Frontend Developer (Next.js 16, React 19, Tailwind CSS, Lucide Icons)  
**Strict Boundaries:** ONLY touch `apps/web/src/app/booking/` and `apps/web/src/components/booking/`. NEVER touch `apps/api/` or `apps/admin/`.

---

## Step-by-Step Execution Plan

### Step 1: Customer Booking Voucher Route

- [ ] Create route `apps/web/src/app/booking/[bookingRef]/page.tsx`:
  - Fetch booking data from `GET /api/v1/public/bookings/:bookingRef`.
  - Handle edge states:
    1. **Loading State:** Luxury travel skeleton loader.
    2. **Not Found State (`404`):** _"Booking reference not found. Please contact your Flyora coordinator."_
    3. **Cancelled State:** Clean alert indicating booking status.

---

### Step 2: Luxury Digital Voucher UI Design

- [ ] **Branded Header & Booking Reference Banner:**
  - Flyora Travels official emblem and watermark.
  - Booking Reference Badge: `BK-2026-XXXX`.
  - Status pill: `CONFIRMED` (green) / `COMPLETED`.
  - Lead Traveler greeting: _"Confirmed Booking for [Customer Name]"_.
- [ ] **Trip Overview Section:**
  - Destination / Package Name.
  - Travel Date & Duration.
  - Primary Coordinator Name & Direct Contact phone.
- [ ] **Confirmed Travel Itinerary & Services Cards:**
  - ✈️ **Flight Schedule:** Airlines, sectors, timings, baggage allowance.
  - 🏨 **Hotel Accommodations:** Property name, room type, nights, meal plan.
  - 📄 **Visa & Sightseeing Inclusions:** Visa status, excursions, private transfers.
- [ ] **Payment Status & Financial Summary:**
  - Total Package Amount: `₹XX,XXX`.
  - Verified Paid Amount: `₹XX,XXX`.
  - Remaining Due Balance: `₹XX,XXX` (if balance is ₹0, display large green badge: _"Fully Paid & Verified"_).

---

### Step 3: Action Bar & WhatsApp Dispatch

- [ ] **Floating Action Bar (Mobile & Desktop):**
  - **"Print / Save PDF Voucher" Button:**
    - Triggers `window.print()`.
    - Custom `@media print` CSS so header, booking reference, hotel details, and payment summary print as a crisp 1-2 page official voucher.
  - **"Chat with Coordinator on WhatsApp" Button:**
    - Large emerald button opening WhatsApp with pre-filled message:
      `"Hi [Coordinator Name], I am checking my booking BK-2026-XXXX for [Destination]. I have a query regarding..."`
  - **"Emergency Call" Button:** Click-to-call coordinator's phone number.

---

### Step 4: SEO & Metadata

- [ ] Implement `generateMetadata` in `page.tsx`:
  - Title: _"Flyora Travels — Confirmed Trip Voucher [bookingRef]"_
  - Robots: `noindex, nofollow` (Vouchers contain private customer itinerary info and must NOT be crawled by search engines).

---

### Step 5: Verification & Tests

- [ ] Run `npm run test:module3 --workspace=@flyora/web` to ensure 0 regression.
- [ ] Run `npm run build --workspace=@flyora/web` to confirm Next.js Turbopack compiles with 0 errors.
