# Module 9: Special Fare Tickets — Milestones & Execution Checklist

This checklist tracks the implementation progress of the **Special Fare Tickets (Bulk Flight Deals)** module across all monorepo workspaces.

---

## Milestone 1: Data Contracts & Database Migration (Phase 1)

- [x] Add `FlightType`, `SpecialFareStatus` enums and `SpecialFareTicket` model to `packages/database/prisma/schema.prisma`.
- [x] Include flexible `metadata Json?` field to accommodate custom forthcoming admin fields.
- [x] Run `npm --prefix packages/database run generate` and apply Prisma migration.
- [x] Create shared TypeScript interfaces in `packages/types/src/specialFare.ts`.
- [x] Create shared Zod schemas in `packages/validators/src/specialFareSchemas.ts`.
- [x] Export contracts from `packages/types` and `packages/validators`.

---

## Milestone 2: Fastify Backend REST API (Phase 2)

- [x] Create `apps/api/src/modules/special-fares/special-fares.service.ts`:
  - [x] Implement `getPublicSpecialFares()` with zero-maintenance auto-expiry filtering.
  - [x] Implement `getPublicRoutes()` for dynamic sector filter pills.
  - [x] Implement `getAdminSpecialFares()` with full margin and PNR data.
  - [x] Implement `createSpecialFare()` with default expiry helper.
  - [x] Implement atomic `updateAvailableSeats()` (`[ - ] / [ + ]` counter).
  - [x] Implement `toggleSpecialFareStatus()`.
- [x] Create `apps/api/src/modules/special-fares/special-fares.controller.ts`:
  - [x] Wire public routes under `/api/v1/public/special-fares`.
  - [x] Wire admin routes under `/api/v1/admin/special-fares` with JWT & RBAC guards.
  - [x] Wire lead creation endpoint `/api/v1/public/special-fares/:id/enquire`.
- [x] Register routes in `apps/api/src/server.ts`.
- [x] Write integration tests verifying auto-expiry, cost field exclusion from public APIs, and atomic seat count protection.

---

## Milestone 3: Admin Inventory Desk (Phase 3)

- [x] Add "Special Fares" navigation link to `apps/admin` sidebar.
- [x] Create `/special-fares` route and main inventory dashboard page.
- [x] Build the Top Metrics bar (Active allotments, seats remaining, expiring in 24h, total margin).
- [x] Build the inventory table with relative departure countdown badges and margin indicators.
- [x] Build the 1-click interactive seat counter widget (`[ - ] X / Y [ + ]`) with optimistic updates.
- [x] Build the "Add Special Fare Allotment" drawer with React Hook Form + Zod validation.
- [x] Include the extensible container ready to accept final business fields.

---

## Milestone 4: Public Deal Portal & Search Integration (Phase 4 & 5)

- [x] Create `apps/web/src/app/special-fares/page.tsx` with search bar, date price strip, and 2-column filters.
- [x] Build the sector filter pill strip with dynamic routes from API.
- [x] Build the clean flight deal rows (`rounded-[14px]`, airline badge, baggage allowance, seat urgency pill, expandable details).
- [x] Build `SpecialFareClaimModal` for booking requests routed straight to CRM leads pool.
- [x] Connect `HeroSearchCard.tsx` under Flight Booking tab to query matching deals and display active special fare banner.
- [x] Add Navbar brush-stroke "Special Fares" badge linking to `/special-fares` + Footer link.

---

## Milestone 5: End-to-End Verification & Production Readiness

- [x] Verify zero cost leakage: Confirmed `supplierCost` and `pnrNumber` never appear in public API DTOs or responses.
- [x] Run unit & integration test suites across `apps/api`, `apps/admin`, and `apps/web` (all passing).
- [x] Run Next.js production build (`@flyora/web`) and TypeScript checks across workspaces (0 errors).
