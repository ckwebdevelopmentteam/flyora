# Dev 3 (Public Web) — Module 5 Implementation Checklist

**Role:** Public Web Frontend Developer (Next.js 16, React 19, Tailwind CSS, Lucide Icons)  
**Strict Boundaries:** ONLY touch `apps/web/src/app/quote/` and `apps/web/src/components/quote/`. NEVER touch `apps/api/` or `apps/admin/`.

---

## Step-by-Step Execution Plan

### Step 1: Customer Proposal Route

- [ ] Create route `apps/web/src/app/quote/[token]/page.tsx`:
  - Fetch quote data from `GET /api/v1/public/quotes/:token`.
  - Handle 3 edge states gracefully:
    1. **Loading State:** Clean skeleton loader with Flyora branding.
    2. **Not Found State (`404`):** _"Quotation not found or link has expired"_.
    3. **Expired State:** Show banner _"This quotation expired on [Date]. Please contact your coordinator for an updated quote"_.

---

### Step 2: Zero Internal Cost Leakage Verification

- [ ] 🛑 **CRITICAL AUDIT:** Inspect the data returned from API:
  - Must NEVER contain `supplierCost`, `marginAmount`, `marginPercent`, or internal notes.
  - Only show client-facing prices (`quotedPrice`, `totalPrice`).

---

### Step 3: Premium Branded Proposal UI Design

- [ ] **Header Section:**
  - Flyora Travels logo and luxury travel banner.
  - Personal greeting: _"Prepared exclusively for [Customer Name]"_.
  - Reference: Quote `#FLY-2026-XXXX`.
  - Validity badge: _"Offer valid until [Date]"_ with a subtle countdown tag.
- [ ] **Trip Overview Card:**
  - Destination / Package Title.
  - Travel Dates & Passenger count (Adults / Children).
  - Primary Contact: Assigned Coordinator name & Flyora office badge.
- [ ] **Itemized Inclusions Cards:**
  - Group items cleanly by category:
    - ✈️ **Flights:** Carrier, Flight routes, Baggage allowances.
    - 🏨 **Accommodation:** Hotel name, Room category, Nights, Meal plan.
    - 📄 **Visa Assistance:** Processing type, Visa validity.
    - 🚗 **Transfers & Excursions:** Private/Shared vehicle, Airport pick & drop, Sightseeing excursions.
- [ ] **Inclusions vs Exclusions Breakdown:**
  - 2-column comparison card:
    - Green checkmarks: Inclusions (e.g. Breakfast, Transfers, Entry tickets).
    - Muted red crosses: Exclusions (e.g. Personal expenses, Tourism tax).
- [ ] **Total Investment Summary:**
  - Prominent price card with final all-inclusive price in Indian Rupees (`₹XX,XXX`).
  - Clear note: _"All applicable taxes included. No hidden charges."_

---

### Step 4: Floating Call-to-Action Bar (Mobile & Desktop)

- [ ] Fixed bottom bar on mobile, sticky sidebar or bottom card on desktop:
  - **Primary Action (WhatsApp):**
    - Large emerald green button: _"Accept & Confirm via WhatsApp"_.
    - Opens WhatsApp directly to assigned coordinator's number with pre-filled message:
      `"Hi [Coordinator Name], I reviewed quotation #FLY-2026-XXXX for [Destination]. I would like to confirm and proceed with booking!"`
  - **Secondary Action (Call):**
    - Button: _"Call Coordinator"_ (`tel:+91...`).
  - **Tertiary Action (Print/Save PDF):**
    - Button: _"Print / Save PDF"_ (`window.print()`).
    - Include clean `@media print` CSS so headers, banners, and item tables print onto a 1-to-2 page PDF cleanly.

---

### Step 5: SEO & OpenGraph Metadata

- [ ] Implement `generateMetadata` in `page.tsx`:
  - Title: _"Flyora Travels — Your Custom Quotation"_
  - Description: _"View your customized travel proposal and itinerary prepared by Flyora Travels."_
  - Robots: `noindex, nofollow` (Quotations are private customer documents and must NOT be indexed by search engines!).

---

### Step 6: Testing & Verification

- [ ] Run `npm run test:module3 --workspace=@flyora/web` to ensure no regression.
- [ ] Run `npm run build --workspace=@flyora/web` to confirm Next.js Turbopack compiles with 0 errors.
