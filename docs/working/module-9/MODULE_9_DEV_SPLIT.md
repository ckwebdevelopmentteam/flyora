# Module 9: Special Fare Tickets (Bulk Flight Deals) — Multi-Developer Work Split

**Phase:** Phase 8 (Module 9)  
**Goal:** Build an in-house inventory, search matching, and booking engine for bulk-purchased airline flight tickets (contracted group PNR blocks and fixed departures), allowing Flyora to surface discounted offers during customer searches, clear last-minute seats, earn healthy margins, and feed leads directly into the Flyora CRM.

---

## 1. 🛫 Business Model & Workflow Breakdown

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               FLYORA BUSINESS MECHANICS                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
           1. Wholesale Buying        ▼        2. In-House Inventory
     ┌─────────────────────────┐          ┌─────────────────────────┐
     │ Flyora buys group seats │          │ Admin enters allotment  │
     │ in bulk from airlines   │ ───────► │ with wholesale cost,    │
     │ (e.g. 30 seats CCJ→DXB) │          │ selling fare, and seats │
     └─────────────────────────┘          └─────────────────────────┘
                                                       │
                                      3. Customer Search Match
                                                       │
                  ┌────────────────────────────────────┴────────────────────────────────────┐
                  ▼                                                                         ▼
     [Customer on apps/web]                                                    [Dedicated /special-fares]
     Searches: From CCJ ➔ To DXB on 28th Nov                                   Customer browses active bulk
                  │                                                            deals by sector filter pills
                  ▼                                                                         │
       MATCHING ENGINE CHECKS:                                                              │
       Does Flyora have active seats?                                                       │
       ✔ Sector matches (CCJ ➔ DXB)                                                        │
       ✔ Date matches (or flexible ±1–3 days)                                               │
       ✔ Available seats > 0                                                                │
       ✔ Not expired                                                                        │
                  │                                                                         │
                  ├───────────────────────────────────┬─────────────────────────────────────┘
                  ▼                                   ▼
        [Direct Sector Match]               [Nearby / Last-Minute Deals]
     Prominent Hero Offer Banner:         Urgency Pill: "Only 3 seats left!"
     "Special Group Fare Found: ₹9,200    "Departing tomorrow · Save 35%"
     (Market: ₹13,500 · Save ₹4,300)"                       │
                  │                                         │
                  └───────────────────┬─────────────────────┘
                                      ▼
                        4. Customer Claims Deal
                        Enquiry modal prefilled
                        Tagged: [SPECIAL FARE]
                                      │
                                      ▼
                        5. Flyora Coordinator Follow-up
                        Lead appears in "Take Lead" CRM pool.
                        Coordinator confirms payment & issues ticket.
                        Live seat count decrements in 1 click: [ - ] 3 / 20 [ + ]
```

### 1.1 Why This Generates Massive Profit & High Conversion

1. **Wholesale Margin (Flyora's Profit):**
   - Live airline counter rate: ₹14,500
   - Flyora wholesale contract price (`supplierCost`): ₹7,200
   - Flyora special selling fare (`farePerSeat`): ₹10,200
   - **Customer Saves:** ₹4,300 (Irresistible 30% discount + 30kg baggage guarantee)
   - **Flyora Margin:** ₹3,000 per passenger ($\approx 29.4\%$ gross margin)
2. **Eliminating Middlemen:**
   - Instead of selling bulk seats through external B2B reseller panels or chaotic WhatsApp groups, Flyora captures direct customer data and keeps 100% of the commission.
3. **Last-Minute Inventory Clearance:**
   - Unsold seats close to departure date are dead losses for an agency.
   - The system introduces **visual urgency timers** and enables coordinators to adjust prices or broadcast last-minute deals before the auto-expiry cutoff.

---

## 2. 🧩 Architecture Strategy for Forthcoming Admin Fields

> [!IMPORTANT]
> The exact input fields for the Admin ticket entry drawer are being finalized by the business team.
> To prevent any rework or database migrations later, our architecture uses a **Hybrid Fixed-Plus-Extensible Schema**:

1. **Fixed Core Fields (Universal to All Flight Deals):**
   - Route: Origin airport (`code`, `city`) $\to$ Destination airport (`code`, `city`)
   - Airline & Flight: Airline name, airline code (for logo), flight number
   - Schedule: Departure date & time, arrival date & time, flight type (Non-stop / Connecting)
   - Baggage: Standard baggage allowance string (e.g. `30 Kg Check-in + 7 Kg Cabin`)
   - Commercials: Total seats, available seats, customer selling fare, net supplier cost, PNR reference
   - Lifecycle: Auto-expiry timestamp, active toggle switch, status enum
2. **Extensible JSON Payload (`metadata: Json?`):**
   - When the user provides the final specific admin fields (e.g., _Terminal number, Aircraft model, Meal preference, Refund policy code, Sub-agent allotment split, Fare basis code_), they can be stored instantly inside `metadata` without altering the database schema or breaking the API contracts.

---

## 3. 🛡️ Critical Security Rules & Guardrails

1. **Zero Cost Leakage to Public Frontend:**
   - `supplierCost`, `pnrNumber`, `marginPercent`, and internal `notes` must **NEVER** be returned by public endpoints (`GET /api/v1/public/special-fares`).
   - Only authenticated staff with `SUPER_ADMIN`, `OPERATIONS_MANAGER`, or `SERVICE_COORDINATOR` can see internal costs and margins.
2. **Zero-Maintenance Auto-Expiry:**
   - Every public query automatically filters out expired tickets at the database query level:
     ```ts
     where: {
       isActive: true,
       status: "ACTIVE",
       availableSeats: { gt: 0 },
       expiresAt: { gt: new Date() },
     }
     ```
   - No cron job failure can cause an expired flight to show to customers.
3. **Atomic Seat Adjustment:**
   - Seat decrements (`PATCH /api/v1/admin/special-fares/:id/seats`) must use atomic Prisma updates (`decrement: 1`) with bounds checking (`availableSeats >= 0`) to prevent race conditions during high sales volume.

---

## 4. 🗂️ Multi-Developer Work Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 0: Base Contracts First (Types & Validators)                     │
│ packages/types/src/specialFare.ts + packages/validators/src/...        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│ DEV 1: BACKEND    │      │ DEV 2: ADMIN UI   │      │ DEV 3: WEB SEARCH │
│ apps/api          │      │ apps/admin        │      │ apps/web          │
│ packages/database │      │ Special Fares Desk│      │ Hero Match & Page │
│ REST API & Expiry │      │ Live Seat Counter │      │ /special-fares    │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

| Developer              | Strict Directory Boundaries                                                                                                | Files Never to Touch           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----------------------------- |
| **Dev 1 (Backend)**    | `apps/api/src/modules/special-fares/`, `packages/database/prisma/schema.prisma`, `packages/types/`, `packages/validators/` | `apps/admin/**`, `apps/web/**` |
| **Dev 2 (Admin UI)**   | `apps/admin/src/pages/special-fares/`, `apps/admin/src/components/special-fares/`, `apps/admin/src/routes/`                | `apps/api/**`, `apps/web/**`   |
| **Dev 3 (Public Web)** | `apps/web/src/app/special-fares/`, `apps/web/src/components/special-fares/`, `apps/web/src/components/HeroSearchCard.tsx`  | `apps/api/**`, `apps/admin/**` |

---

## 5. 📑 Document Index for Module 9

Detailed checklists for each developer are available in this directory:

- [DEV1_BACKEND_CHECKLIST.md](./DEV1_BACKEND_CHECKLIST.md) — Database models, Fastify controllers, services, tests, and auto-expiry logic.
- [DEV2_ADMIN_CHECKLIST.md](./DEV2_ADMIN_CHECKLIST.md) — Admin navigation, allotment table, fast seat adjustment widget, and drawer form.
- [DEV3_PUBLIC_WEB_CHECKLIST.md](./DEV3_PUBLIC_WEB_CHECKLIST.md) — Public `/special-fares` portal, Hero flight search matching engine, and enquiry flow.
