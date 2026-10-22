# Flyora Travels — Phase-by-Phase Implementation Checklist

This checklist serves as the master tracking document for the development of Flyora Tours & Travels. Mark items as completed as development proceeds.

---

## Phase 0: Monorepo Scaffolding & Shared Infrastructure
- [ ] Initialize monorepo root workspace configuration (`apps/*`, `packages/*`).
- [ ] Move existing Next.js web application to `apps/web`.
- [ ] Scaffold `apps/admin` (Vite + React + TypeScript + Tailwind CSS).
- [ ] Scaffold `apps/api` (Fastify + TypeScript).
- [ ] Create `packages/types` for shared TypeScript models.
- [ ] Create `packages/validators` for shared Zod schemas (enquiry, quote, payment).
- [ ] Create `packages/database` with Prisma ORM setup.
- [ ] Configure root `turbo.json` and unified `npm run dev` scripts.
- [ ] Setup Code Quality & Git Hooks:
  - [ ] Initialize **Husky** (`pre-commit` hook for lint-staged, `commit-msg` hook for commitlint).
  - [ ] Configure **Commitlint** (`commitlint.config.js` with Conventional Commits rules).
  - [ ] Configure **lint-staged** (auto-linting TypeScript, ESLint, Prettier formatting).

---

## Phase 1: Database & Core Fastify API Setup
- [ ] Write `schema.prisma` covering:
  - [ ] `User`, `UserRole`, `StaffAvailability`
  - [ ] `Service`, `UserService` (Service Coordinator mapping)
  - [ ] `Package` (Itineraries, pricing, inclusions, SEO fields)
  - [ ] `Customer`, `Lead`, `LeadActivity`
  - [ ] `Quotation` (Supplier cost, selling price, margin, items JSON)
  - [ ] `Booking`, `Payment` (Offline refs, R2 receipt file keys)
- [ ] Run initial PostgreSQL Prisma migration.
- [ ] Configure Fastify plugins:
  - [ ] `@fastify/cors` with admin and web origin whitelists
  - [ ] `@fastify/jwt` authentication and token verification
  - [ ] Prisma Client plugin singleton
  - [ ] Cloudflare R2 S3 Client provider plugin
- [ ] Implement Auth Module:
  - [ ] Staff login with JWT access + refresh tokens
  - [ ] Current user profile endpoint (`/api/v1/auth/me`)
  - [ ] Admin staff management & service-coordinator assignment endpoints

---

## Phase 2: Cloudflare R2 Object Storage Integration
- [ ] Set up Cloudflare R2 credentials (Account ID, Access Key ID, Secret Access Key).
- [ ] Implement presigned upload URL generator for `flyora-public` (Tour images/galleries).
- [ ] Implement presigned upload URL generator for `flyora-private` (Payment receipt proofs, customer documents).
- [ ] Implement secure temporary presigned download URL generator (15-minute token expiry for private documents).

---

## Phase 3: "Take Lead" Service Pool & Coordinator Workflow
- [ ] Implement public enquiry submission endpoint (`POST /api/v1/public/enquiry`).
- [ ] Implement Lead Notification Service:
  - [ ] Dispatch new lead alert to registered phone numbers of coordinators assigned to that service + Admin.
- [ ] Implement "Take Lead" Service Pool:
  - [ ] New leads enter `serviceId` unassigned pool (`assignedToId = null`).
  - [ ] Service coordinators only see leads belonging to their service(s).
  - [ ] Admin / Manager sees all leads across all services.
- [ ] Implement Atomic "Take Lead" Action (`POST /api/v1/leads/:id/take`):
  - [ ] Locks lead to claiming coordinator (`assignedToId = coordinatorId`, `claimedAt = now`).
  - [ ] Disappears from other coordinators' pool views.
  - [ ] Moves to claiming coordinator's "My Leads" dashboard.
  - [ ] Handles concurrency (returns 409 if already claimed by someone else).
- [ ] Implement Coordinator Lead Actions:
  - [ ] Status update (`New` -> `Contacted` -> `Quoted` -> `Booked` -> `Lost`).
  - [ ] Add internal notes & optional follow-up reminder date.
  - [ ] Admin manual reassign endpoint (if coordinator is absent).

---

## Phase 4: Quotation Builder & Margin Guard
- [ ] Implement Quotation creation endpoint with itemized breakdown (Hotel, Flight, Visa, Tour, Transfers).
- [ ] Implement Margin Guard calculation:
  - [ ] Calculate Margin %: `((Selling Price - Supplier Cost) / Selling Price) * 100`.
  - [ ] Compare against `service.minMarginPercent`.
  - [ ] Return warning flag if quote falls below margin threshold.
- [ ] Generate secure unique `shareToken` for each quotation.
- [ ] Implement public quotation fetch endpoint (`GET /api/v1/public/quotes/:shareToken`).
- [ ] Build customer-facing Quote Page on `apps/web/src/app/quote/[token]/page.tsx` with clean itinerary presentation and validity countdown.

---

## Phase 5: Booking & Manual Payment Tracking
- [ ] Implement one-click quote-to-booking conversion endpoint.
- [ ] Implement manual payment logging:
  - [ ] Record amount, payment mode (NEFT/IMPS, UPI, Cash), and transaction UTR.
  - [ ] Attach Cloudflare R2 private file key for uploaded receipt slip.
- [ ] Implement payment verification endpoint (restricted to Admin/Accounts roles).
- [ ] Automatically update booking payment progress (`dueAmount = totalAmount - verifiedPaidAmount`).

---

## Phase 6: Admin & Coordinator Portal (`apps/admin`)
- [ ] Setup TanStack Query (`@tanstack/react-query`) provider for server-state caching.
- [ ] Setup Zustand stores (`authStore` for credentials, `filterStore` for lead tabs).
- [ ] Build Staff Login screen.
- [ ] Build Coordinator Dashboard:
  - [ ] Service Filter Tabs ("All", "Holidays", "Visas", "Flights", "Umrah").
  - [ ] Lead Inbox table with TanStack Table (sort by date, customer, status).
  - [ ] Lead Details Drawer: customer details, timeline notes, stage selector.
- [ ] Build Quotation Builder modal with real-time Margin Guard indicator.
- [ ] Build Booking & Payment Viewer with in-browser receipt viewer (presigned R2 image/PDF).
- [ ] Build Team & Service Coordinator configuration screen (Admin only).

---

## Phase 7: Public Website & SEO (`apps/web`)
- [ ] Build Homepage with hero search, featured tour packages, and services showcase.
- [ ] Build `/tours/[slug]` tour details page with photo gallery, day-by-day itinerary, inclusions/exclusions.
- [ ] Build `/services/[slug]` landing pages for Visas, Flights, and Custom Holidays.
- [ ] Add Smart Click-to-WhatsApp CTA on all packages with pre-filled package context.
- [ ] Implement dynamic SEO tags and OpenGraph cards (`generateMetadata`).
- [ ] Implement JSON-LD schema (`TouristTrip`, `BreadcrumbList`, `TravelAgency`).
- [ ] Set up auto-generating `sitemap.xml` and `robots.txt`.

---

## Phase 8: Verification & Production Readiness
- [ ] Verify lead submission from public site routes directly to the correct service coordinator.
- [ ] Verify image uploads and receipt uploads to Cloudflare R2 buckets.
- [ ] Verify customer quote shareable link renders correctly on mobile and desktop.
- [ ] Audit role-based access: verify coordinators cannot view other service leads without permission.
- [ ] Perform Lighthouse Core Web Vitals audit on public Next.js pages.
