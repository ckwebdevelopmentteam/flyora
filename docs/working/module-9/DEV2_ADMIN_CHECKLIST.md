# Dev 2 (Admin UI) Checklist — Special Fare Tickets Module

**Assigned:** Dev 2 (Admin Portal)  
**Scope:** `apps/admin/src/pages/special-fares/`, `apps/admin/src/components/`, `apps/admin/src/routes/`

---

## 1. 🧭 Navigation & Sidebar Integration

- Add **"Special Fares"** to the Admin sidebar alongside Tour Packages and Leads.
- Icon: Lucide `PlaneTakeoff` or `TicketPercent`.
- Active badge showing current count of live allotments.
- Route: `/special-fares`.

---

## 2. 📊 Inventory Master Dashboard (`apps/admin/src/pages/special-fares/`)

### 2.1 Top Metrics Bar (4 Key Metric Cards)

1. **Active Allotments**: Total live ticket groups currently available for booking.
2. **Total Seats in Inventory**: Sum of `availableSeats` across all active deals.
3. **Expiring in 24 Hours**: Allotments requiring urgent sales push or discount adjustment.
4. **Total Revenue / Profit Potential**: Estimated margin across remaining seats.

### 2.2 Inventory Management Table

Columns:

1. **Route & Airline**: Airline logo badge, airline name, flight number, origin $\to$ destination (`CCJ` $\to$ `DXB`).
2. **Schedule**: Departure date/time with a relative countdown badge (_"In 3 days"_, _"Tomorrow"_, _"Departed"_).
3. **Baggage Allowance**: Pill display (e.g. `30 Kg Check-in`).
4. **Live Seat Counter Widget**:
   - Interactive 1-click counter: `[ - ] 4 / 20 [ + ]`
   - Decrementing updates backend via `PATCH /api/v1/admin/special-fares/:id/seats` optimistically.
   - Prevents having to open full edit forms during busy phone booking calls.
5. **Pricing & Margin Bar**:
   - Customer Fare: `₹9,499`
   - Supplier Net Cost: `₹6,800`
   - Margin Badge: `+₹2,699 (28.4%)` in emerald green.
6. **Expiry & Urgency**:
   - Shows `expiresAt` with color-coded countdown (Normal $\to$ Amber if $<24$ hrs $\to$ Red if $<6$ hrs).
7. **Status & Actions**:
   - Toggle switch for `isActive`.
   - Action menu: Edit in Drawer, Duplicate Allotment, Soft Delete.

---

## 3. 📝 "Add Special Fare" Drawer Component

Create `SpecialFareDrawer.tsx` utilizing React Hook Form + Zod (`createSpecialFareSchema`):

### 3.1 Standard Essential Form Sections

1. **Sector & Flight**:
   - Origin Airport (City & 3-letter IATA code, e.g. Kozhikode / `CCJ`).
   - Destination Airport (City & 3-letter IATA code, e.g. Dubai / `DXB`).
   - Airline Name & Code (`Air India Express` / `IX`).
   - Flight Number (e.g. `IX-345`).
   - Flight Type: Radio buttons (`Non-Stop` / `Connecting`).
2. **Schedule & Timings**:
   - Departure Date & Time picker.
   - Arrival Date & Time picker.
   - Auto-calculated Duration label.
3. **Baggage Policy**:
   - Quick preset buttons: `20 Kg`, `30 Kg`, `40 Kg`, `7 Kg Cabin`.
   - Custom baggage text input.
4. **Commercials & Seats**:
   - Total Seats (Quota).
   - Available Seats (Defaults to Total Seats).
   - Supplier Net Cost (Flyora's purchase price).
   - Selling Price (Customer fare).
   - Real-time Margin Preview: Shows calculated profit and margin % as numbers are typed.
   - Group PNR Reference (Internal airline PNR).
5. **Auto-Expiry Configuration**:
   - Suggested default: Departure Time minus 6 hours.
   - Custom expiry datetime picker.

### 3.2 🔌 Flexible Extension Container (For Forthcoming Fields)

- Dedicated dynamic form block: `Additional Booking Details`.
- Reads and writes to `metadata: Json`.
- Ready to instantly receive any new fields provided by the business team (such as terminal, aircraft type, meal policy, refund codes) with zero structural changes.

---

## 4. ✅ Admin Verification Checklist

- [ ] Sidebar route `/special-fares` loads smoothly for `SUPER_ADMIN`, `OPERATIONS_MANAGER`, and `SERVICE_COORDINATOR`.
- [ ] Table renders live data from `GET /api/v1/admin/special-fares` via TanStack React Query.
- [ ] 1-Click seat decrement/increment works optimistically and syncs with backend.
- [ ] "Add Special Fare" drawer validates input using Zod and handles errors gracefully.
- [ ] Real-time margin preview displays profit accurately before submission.
- [ ] Toggling deal visibility updates database state immediately.
- [ ] Responsive design verified on both desktop and tablet screens.
