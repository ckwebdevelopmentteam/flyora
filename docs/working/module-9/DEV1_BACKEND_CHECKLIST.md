# Dev 1 (Backend) Checklist — Special Fare Tickets Module

**Assigned:** Dev 1 (Backend & Database)  
**Scope:** `packages/database`, `packages/types`, `packages/validators`, `apps/api`

---

## 1. 🗄️ Database Model (`packages/database/prisma/schema.prisma`)

Add the following enums and model to `packages/database/prisma/schema.prisma`:

```prisma
enum FlightType {
  NON_STOP
  CONNECTING
}

enum SpecialFareStatus {
  ACTIVE
  SOLD_OUT
  EXPIRED
  PAUSED
}

model SpecialFareTicket {
  id              String            @id @default(uuid())

  // Flight & Route Details
  airlineName     String            // e.g. "Air India Express", "Emirates", "IndiGo", "Saudia"
  airlineCode     String?           // e.g. "IX", "EK", "6E", "SV" (used for airline logo display)
  flightNumber    String?           // e.g. "IX-345"
  originCity      String            // e.g. "Kozhikode", "Mumbai", "Delhi"
  originCode      String            // e.g. "CCJ", "BOM", "DEL"
  destinationCity String            // e.g. "Dubai", "Jeddah", "Doha", "London"
  destinationCode String            // e.g. "DXB", "JED", "DOH", "LHR"

  departureDate   DateTime          // Scheduled departure time
  arrivalDate     DateTime?         // Scheduled arrival time
  flightType      FlightType        @default(NON_STOP)
  baggageInfo     String            // e.g. "30 Kg Check-in + 7 Kg Cabin"

  // Commercials & Inventory
  totalSeats      Int               // Total batch quota purchased
  availableSeats  Int               // Remaining seats for public booking
  farePerSeat     Decimal           @db.Decimal(10, 2) // Customer selling price
  supplierCost    Decimal?          @db.Decimal(10, 2) // Staff-only wholesale cost
  pnrNumber       String?           // Staff-only airline group PNR reference
  notes           String?           @db.Text           // Internal staff notes

  // Flexible Metadata for Custom Forthcoming Admin Fields
  metadata        Json?             // Holds custom fields (terminals, meal options, refund rules, etc.)

  // Lifecycle & Auto-Expiry
  expiresAt       DateTime          // Exact timestamp when deal stops showing publicly
  status          SpecialFareStatus @default(ACTIVE)
  isActive        Boolean           @default(true)      // Manual visibility switch
  displayOrder    Int               @default(0)

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Performance Indexes for instant public search queries
  @@index([isActive, expiresAt, availableSeats])
  @@index([originCode, destinationCode, departureDate])
  @@index([departureDate, status])
}
```

Run database migration:

```bash
npm --prefix packages/database run generate
# or prisma db push / migrate
```

---

## 2. 📦 Shared Contracts (`packages/types` & `packages/validators`)

### 2.1 Types (`packages/types/src/specialFare.ts`)

- Define `SpecialFareSummary` (Public-safe interface without internal costs/PNR).
- Define `SpecialFareAdminDetail` (Includes `supplierCost`, `pnrNumber`, `marginPercent`, and `notes`).
- Define `SpecialFareQuery` (Filter parameters: `from`, `to`, `date`, `airline`, `page`, `limit`).
- Export in `packages/types/src/index.ts`.

### 2.2 Validators (`packages/validators/src/specialFareSchemas.ts`)

- `createSpecialFareSchema`: Zod schema for Admin creation drawer.
- `updateSpecialFareSchema`: Zod schema for editing existing allotments.
- `updateSeatsSchema`: Zod schema for `availableSeats` adjustment (`{ change: number }` or `{ newCount: number }`).
- `specialFareSearchQuerySchema`: Zod schema for public search filtering.
- Export in `packages/validators/src/index.ts`.

---

## 3. 🚀 Fastify API Endpoints (`apps/api`)

Directory: `apps/api/src/modules/special-fares/`

### 3.1 Public Endpoints (No Auth Required)

| Method | Route                                      | Description                                                                                                                           |
| :----- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/v1/public/special-fares`             | List active, non-expired tickets. Strips all internal costs & PNRs. Supports sector search (`from`, `to`, `date`).                    |
| `GET`  | `/api/v1/public/special-fares/routes`      | Returns distinct available routes (e.g. `[{ originCode: "CCJ", destinationCode: "DXB", count: 4 }]`) for quick frontend filter chips. |
| `GET`  | `/api/v1/public/special-fares/:id`         | Single deal details for modal presentation.                                                                                           |
| `POST` | `/api/v1/public/special-fares/:id/enquire` | Creates a Lead in `packages/database` tagged `[SPECIAL FARE]`, prefilled with route and fare details.                                 |

### 3.2 Admin Endpoints (Protected by JWT & RBAC Guard)

| Method   | Route                                    | Allowed Roles                                              | Description                                                                        |
| :------- | :--------------------------------------- | :--------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `GET`    | `/api/v1/admin/special-fares`            | `SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR` | Full list including inactive/sold-out/expired deals with costs, margins, and PNRs. |
| `POST`   | `/api/v1/admin/special-fares`            | `SUPER_ADMIN`, `OPERATIONS_MANAGER`                        | Create new flight batch allotment.                                                 |
| `PUT`    | `/api/v1/admin/special-fares/:id`        | `SUPER_ADMIN`, `OPERATIONS_MANAGER`                        | Update allotment details, fares, or dates.                                         |
| `PATCH`  | `/api/v1/admin/special-fares/:id/seats`  | `SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR` | 1-click increment/decrement of available seats.                                    |
| `PATCH`  | `/api/v1/admin/special-fares/:id/toggle` | `SUPER_ADMIN`, `OPERATIONS_MANAGER`                        | Toggle `isActive` on/off immediately.                                              |
| `DELETE` | `/api/v1/admin/special-fares/:id`        | `SUPER_ADMIN`                                              | Soft-delete or archive record.                                                     |

---

## 4. ⚙️ Zero-Maintenance Auto-Expiry Logic

In `special-fares.service.ts`:

```ts
export const getPublicSpecialFares = async (
  filters: SpecialFareSearchFilters,
) => {
  const now = new Date();

  return prisma.specialFareTicket.findMany({
    where: {
      isActive: true,
      status: "ACTIVE",
      availableSeats: { gt: 0 },
      expiresAt: { gt: now }, // Guaranteed zero-maintenance filter
      ...(filters.originCode && {
        originCode: filters.originCode.toUpperCase(),
      }),
      ...(filters.destinationCode && {
        destinationCode: filters.destinationCode.toUpperCase(),
      }),
      ...(filters.departureDate && {
        departureDate: {
          gte: startOfDay(filters.departureDate),
          lte: endOfDay(filters.departureDate),
        },
      }),
    },
    select: {
      id: true,
      airlineName: true,
      airlineCode: true,
      flightNumber: true,
      originCity: true,
      originCode: true,
      destinationCity: true,
      destinationCode: true,
      departureDate: true,
      arrivalDate: true,
      flightType: true,
      baggageInfo: true,
      availableSeats: true,
      farePerSeat: true,
      expiresAt: true,
      // EXCLUDE: supplierCost, pnrNumber, notes (security guard)
    },
    orderBy: [{ displayOrder: "asc" }, { departureDate: "asc" }],
  });
};
```

---

## 5. ✅ Backend Verification Checklist

- [ ] `packages/database`: Prisma migration applied cleanly and client generated.
- [ ] `packages/types` & `packages/validators`: TypeScript builds with zero errors.
- [ ] `apps/api`: All public responses verified to omit `supplierCost`, `pnrNumber`, and internal `notes`.
- [ ] Auto-expiry verified: Expired or 0-seat tickets never return in public queries.
- [ ] Atomic seat adjustment tested: Cannot decrement `availableSeats` below 0 or above `totalSeats`.
- [ ] Lead creation verified: `/enquire` endpoint creates a real CRM lead with `serviceId` mapped to Flight Booking and tagged `[SPECIAL FARE - {route}]`.
- [ ] All unit and integration tests passing (`npm run test` in `apps/api`).
