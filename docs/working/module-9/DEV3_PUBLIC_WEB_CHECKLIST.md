# Dev 3 (Public Web) Checklist — Special Fare Tickets Module

**Assigned:** Dev 3 (Customer Web Frontend)  
**Scope:** `apps/web/src/app/special-fares/`, `apps/web/src/components/special-fares/`, `apps/web/src/components/HeroSearchCard.tsx`

---

## 1. 🔍 Homepage Hero Search Matching Engine (`HeroSearchCard.tsx`)

When visitors select the **Flight Booking** service tab on the homepage hero:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Flight Booking Tab Active]                                            │
│ From: [ Kozhikode (CCJ) ]  To: [ Dubai (DXB) ]  Date: [ 28 Nov 2026 ]  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                       (Async Sector Match Query)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 🔥 SPECIAL GROUP FARE MATCH FOUND FOR THIS SECTOR!                     │
│ Air India Express (Non-Stop) · 30 Kg Baggage Included                  │
│ Special Fare: ₹9,200  (Regular Counter: ₹13,500 — You Save ₹4,300)     │
│ [⚡ Claim This Seat Now]                 [View All 4 Deals on This Route →]│
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Match Logic

1. **Direct Match:** If an active, non-expired special fare ticket exists for the chosen origin, destination, and travel date:
   - Display the high-converting gold/emerald callout card immediately below the search inputs.
   - Clicking "Claim This Seat" launches the Flyora Enquiry Modal prefilled with:
     - Service: `Flight Booking`
     - Sector: `CCJ ➔ DXB`
     - Flight: `IX-345`
     - Fare: `₹9,200`
     - Tag: `[SPECIAL FARE]`
2. **Flexible Date Match:** If tickets exist on the same sector within $\pm 2$ days:
   - Display a compact alternative pill: _"💡 Flyora special fares available on 27th & 29th Nov from ₹8,999. [View Dates]"_.
3. **Fallback:** If no bulk tickets exist for the sector, the standard flight enquiry form seamlessly takes over so no lead is lost.

---

## 2. 🌐 Dedicated Public Deals Portal (`/special-fares`)

Create `apps/web/src/app/special-fares/page.tsx`:

### 2.1 Header Hero Section

- **Headline**: _"Flyora Exclusive Group Fares & Bulk Departures"_
- **Subheadline**: _"Contracted airline allotments at wholesale rates. Guaranteed baggage allowances and confirmed seats up to 40% cheaper than open-market prices."_
- **Trust Badges**: `Guaranteed Baggage Included` · `Direct Airline Confirmed PNR` · `Dedicated Airport Support`.

### 2.2 Sector Filter Strip

- Horizontal pill navigation matching Flyora's visual design:
  - `All Routes`
  - `Kerala ➔ UAE (Dubai / Sharjah / Abu Dhabi)`
  - `Mumbai ➔ Gulf (Doha / Muscat / Bahrain)`
  - `Umrah Sectors (Jeddah / Madinah)`
  - `Delhi ➔ International`
- Filter chips automatically populate from `/api/v1/public/special-fares/routes`.

### 2.3 Deal Card Design Standard (`rounded-[14px]`)

Every deal card follows Flyora's signature editorial luxury standard:

- **Airline Header**: Airline logo/code (`IX`, `EK`, `6E`), flight number, departure time $\to$ arrival time with duration arrow.
- **Flight Attributes**: `Non-Stop` badge, departure date banner.
- **Baggage Allowance**: Prominent green icon + pill (e.g. `🧳 30 Kg Check-in + 7 Kg Cabin Included`).
- **Urgency Indicators**:
  - If seats $\le 3$: Red pulsating pill: _"Only 2 seats left at this price!"_
  - If departure $< 24$ hours: Amber pill: _"Departing Tomorrow · Instant Issuance"_
- **Price Presentation**:
  - Live Airline Counter Price: ~~₹14,500~~
  - Flyora Special Fare: **₹9,499**
  - Savings Pill: _"Save ₹5,001 (34% Off)"_
- **Call-to-Action**: High-visibility "Claim Seat" button opening the Flyora Enquiry Modal with prefilled flight parameters.

---

## 3. 📱 Mobile UX & Performance Requirements

1. **Horizontal Swipe on Mobile**:
   - On screens $< 768$px, deal cards switch to a smooth horizontal snap carousel with pagination dots.
2. **Zero Layout Shift (CLS = 0)**:
   - Fixed aspect ratios and image skeletons for airline logos.
3. **SEO & Metadata**:
   - Dynamic OpenGraph cards: _"Flyora Special Fare Deals — Cheap Flights from Kozhikode & Mumbai to Gulf"_.
   - Structured JSON-LD schema for flight deal offers.

---

## 4. ✅ Public Web Verification Checklist

- [ ] Route `/special-fares` compiles cleanly and renders on desktop and mobile.
- [ ] Sector filter pills update deals list without reloading the page.
- [ ] Deal cards strictly adhere to the `rounded-[14px]` design standard.
- [ ] Urgency pills render correctly based on available seat count and time to departure.
- [ ] Claim button opens the Enquiry Modal with flight sector and deal price prefilled.
- [ ] Enquiry submission creates a verified lead in the database and triggers coordinator notification.
- [ ] Homepage Hero flight search matching displays the special fare callout when matching sectors are typed.
- [ ] Lighthouse Performance score $\ge 90$ with zero hydration errors.
