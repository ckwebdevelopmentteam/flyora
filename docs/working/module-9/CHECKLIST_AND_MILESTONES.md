# Module 9: Special Fare Tickets — Milestones & Execution Checklist

This checklist tracks the implementation progress of the **Special Fare Tickets (Bulk Flight Deals)** module across all monorepo workspaces.

---

## Milestone 1: Data Contracts & Database Migration (Phase 1)

- [ ] Add `FlightType`, `SpecialFareStatus` enums and `SpecialFareTicket` model to `packages/database/prisma/schema.prisma`.
- [ ] Include flexible `metadata Json?` field to accommodate custom forthcoming admin fields.
- [ ] Run `npm --prefix packages/database run generate` and apply Prisma migration.
- [ ] Create shared TypeScript interfaces in `packages/types/src/specialFare.ts`.
- [ ] Create shared Zod schemas in `packages/validators/src/specialFareSchemas.ts`.
- [ ] Export contracts from `packages/types` and `packages/validators`.

---

## Milestone 2: Fastify Backend REST API (Phase 2)

- [ ] Create `apps/api/src/modules/special-fares/special-fares.service.ts`:
  - [ ] Implement `getPublicSpecialFares()` with zero-maintenance auto-expiry filtering.
  - [ ] Implement `getPublicRoutes()` for dynamic sector filter pills.
  - [ ] Implement `getAdminSpecialFares()` with full margin and PNR data.
  - [ ] Implement `createSpecialFare()` with default expiry helper.
  - [ ] Implement atomic `updateAvailableSeats()` (`[ - ] / [ + ]` counter).
  - [ ] Implement `toggleSpecialFareStatus()`.
- [ ] Create `apps/api/src/modules/special-fares/special-fares.controller.ts`:
  - [ ] Wire public routes under `/api/v1/public/special-fares`.
  - [ ] Wire admin routes under `/api/v1/admin/special-fares` with JWT & RBAC guards.
  - [ ] Wire lead creation endpoint `/api/v1/public/special-fares/:id/enquire`.
- [ ] Register routes in `apps/api/src/server.ts`.
- [ ] Write integration tests verifying auto-expiry, cost field exclusion from public APIs, and atomic seat count protection.

---

## Milestone 3: Admin Inventory Desk (Phase 3)

- [ ] Add "Special Fares" navigation link to `apps/admin` sidebar.
- [ ] Create `/special-fares` route and main inventory dashboard page.
- [ ] Build the Top Metrics bar (Active allotments, seats remaining, expiring in 24h, total margin).
- [ ] Build the inventory table with relative departure countdown badges and margin indicators.
- [ ] Build the 1-click interactive seat counter widget (`[ - ] X / Y [ + ]`) with optimistic updates.
- [ ] Build the "Add Special Fare Allotment" drawer with React Hook Form + Zod validation.
- [ ] Include the extensible container ready to accept final business fields.

---

## Milestone 4: Public Deal Portal & Search Integration (Phase 4 & 5)

- [ ] Create `apps/web/src/app/special-fares/page.tsx` with editorial header and trust badges.
- [ ] Build the sector filter pill strip with dynamic routes from API.
- [ ] Build the luxury deal card (`rounded-[14px]`, airline logo, baggage badge, strikethrough price, savings pill, urgency timer).
- [ ] Integrate with Flyora `EnquiryModal.tsx` to prefill flight details upon clicking "Claim Seat".
- [ ] Connect `HeroSearchCard.tsx` under the Flight Booking tab to query matching deals and display the active special fare alert banner.
- [ ] Verify mobile responsiveness, horizontal swipe, and Core Web Vitals.

---

## Milestone 5: End-to-End Verification & Production Readiness

- [ ] End-to-end booking simulation: Admin creates bulk deal $\to$ Appears on `/special-fares` and Hero search $\to$ Customer submits enquiry $\to$ Lead appears in CRM $\to$ Coordinator adjusts seats.
- [ ] Verify zero cost leakage: Ensure `supplierCost` and `pnrNumber` never appear in browser network tab for public visitors.
- [ ] Run full test suites across monorepo (`turbo run test`).
- [ ] Run type checks across all workspaces (`turbo run type-check`).
