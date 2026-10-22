# Flyora Travels — Architecture & Tech Stack Specification

**Project:** Flyora Tours & Travels  
**Target:** 3-Tier Monorepo (Public Web, Admin/Coordinator Portal, Backend REST API)  
**Date:** October 2026  
**Status:** Approved Architecture (No Coding Phase)

---

## 1. Executive Summary & Changes from Initial PDF Proposal

The project is built as a unified TypeScript monorepo with 3 distinct application targets sharing database types and validation schemas.

### ❌ Removed / Deferred from Initial PDF:
1. **Redis & BullMQ:**  
   *Reason:* Avoids running separate Redis instances and complex worker orchestration for an initial 8–10 staff team. Tasks like lead follow-ups and data maintenance are handled through lightweight PostgreSQL timestamp queries and simple in-process `node-cron` schedules when needed.
2. **Complex SLA Timers / Escalation Clocks:**  
   *Reason:* Simplified as requested. No rigid countdown clocks, penalty timers, or automatic manager escalations. Instead, leads follow a clear, transparent status pipeline with simple "Days in Current Stage" visibility.
3. **Payment Gateways (Stripe / Razorpay / PayU):**  
   *Reason:* Payment collection is manual/offline (Bank transfer, UPI, Cash). Staff record transaction reference numbers and upload receipt slips for dual verification.
4. **WhatsApp Inbound Bot / Two-Way Chat Engine:**  
   *Reason:* Public site uses **Click-to-WhatsApp** with pre-filled context (package name, reference ID, customer intent). Coordinators chat directly using official WhatsApp; leads are captured or updated cleanly in the dashboard.
5. **Live GDS / Supplier Flight & Hotel APIs:**  
   *Reason:* Kept for Phase 3. There are **zero live ticket or hotel room price feeds**. The public website displays indicative "Starting from" prices with "Enquire via Call / WhatsApp" triggers. When customers enquire, staff/coordinators check offline supplier rates by call or WhatsApp, and manually enter flight ticket costs, hotel room charges, visa fees, and markup into the **Module 5 Quotation Builder**.
6. **AWS S3 / Cloudinary:**  
   *Reason:* Replaced by Cloudflare R2.

### ➕ Added / Tailored Decisions:
1. **Cloudflare R2 as Unified Object Storage:**  
   *Reason:* Zero egress fees, native S3-compatible API via `@aws-sdk/client-s3`. Public bucket for tour galleries and destination banners; private bucket with short-lived presigned URLs for payment receipts and sensitive customer documents (passports, visas).
2. **Fastify + TypeScript Backend:**  
   *Reason:* Low overhead, top-tier performance, native schema validation support, and clean plugin-based architecture.
3. **Prisma ORM with PostgreSQL:**  
   *Reason:* Intuitive declarative schema modeling, type-safe client, robust migration system, and seamless integration across monorepo packages.
4. **Service-Based "Take Lead" Pool & Notification Routing:**  
   *Reason:* Each service has 2 or more coordinators registered with their phone/WhatsApp numbers. When a new lead arrives for a service, an instant alert is sent to those service coordinators' numbers and the Admin. The lead enters the service's "Unassigned Lead Pool". Any coordinator of that service can click **"Take Lead"** — which atomically locks it to them and makes it instantly disappear from all other coordinators' pool views into their personal "My Leads" workspace. No complicated scheduling algorithms or bot traps.

---

## 2. Core Technology Stack

| Domain | Technology | Justification |
| :--- | :--- | :--- |
| **Monorepo Manager** | **Turborepo + npm/pnpm** | Fast caching, shared scripts (`build`, `dev`, `lint`), seamless inter-package imports. |
| **Public Website** | **Next.js 16 (App Router, TS)** | High-ranking SEO, Server-Side Rendering (SSR), Incremental Static Regeneration (ISR) for tour packages, dynamic OpenGraph cards, JSON-LD travel schema. |
| **Backend REST API** | **Fastify (TypeScript)** | Lightweight, schema-driven, ultra-fast routing, clean modular plugin system. |
| **Admin & Staff Portal** | **Vite + React (TypeScript)** | Isolated SPA deployed on `admin.flyora.com`. Fast HMR, no SSR overhead, independent deployment from public site. |
| **Database** | **PostgreSQL** | Relational integrity for Customers, Leads, Quotes, Bookings, Payments, and Staff. |
| **ORM** | **Prisma** | End-to-end type safety, auto-generated TypeScript types shared with frontend. |
| **Storage** | **Cloudflare R2** | Zero bandwidth/egress cost, high-speed CDN integration, S3 API compatibility. |

---

## 3. Frontend Libraries Evaluation (Admin & Web)

### 1. TanStack Query (React Query)
- **Status:** **STRONGLY REQUIRED (Admin Portal)**
- **Why it is needed:**  
  The Admin/Coordinator dashboard is almost entirely **server state**. Leads change status, coordinators filter by service, quotes are generated, and payments are logged.  
  - Without TanStack Query: You end up with dozens of messy `useEffect` hooks, manual loading flags, desynchronized table states, and duplicate network requests.
  - With TanStack Query: Instant caching, automatic background revalidation when switching tabs, declarative mutations with optimistic UI updates (e.g. instantly moving a lead from "New" to "Contacted"), and unified pagination support.

### 2. Zustand
- **Status:** **REQUIRED (Admin Portal - Lightweight)**
- **Why it is needed:**  
  TanStack Query handles *server* state, but Zustand handles **client-only global state**:
  - Authenticated staff user session & tokens (persisted in secure storage).
  - UI state (sidebar collapsed/expanded, dark/light theme, notification drawer).
  - Active filter presets in the Lead Inbox (e.g., active service selection, date range filter).
  - Draft multi-item quote builder state (holding temporary items before sending to the API).
  - *Why not Redux?* Redux has enormous boilerplate; Zustand is under 1KB, has zero boilerplate, and is hook-based.

### 3. TanStack Table (React Table)
- **Status:** **REQUIRED (Admin Portal)**
- **Why it is needed:**  
  Coordinators and Admins will view hundreds of leads. TanStack Table gives headless control over sorting (by newest, value, customer name), filtering by service, custom column visibility, pagination, and bulk lead selection for re-assignment.

### 4. React Hook Form + Zod
- **Status:** **REQUIRED (Both Public Web & Admin)**
- **Why it is needed:**  
  Zod schemas are declared once in `packages/validators` and shared across the Fastify API (payload validation), the Next.js public enquiry form, and the Admin quotation/payment forms. This guarantees zero mismatch between client and server validation.

---

## 4. Cloudflare R2 Storage Design

Cloudflare R2 provides an S3-compatible API accessed via `@aws-sdk/client-s3`.

```
Cloudflare R2 Storage
├── Bucket: flyora-public (Public Read via custom domain / CDN)
│   ├── /packages/       (Tour package cover photos & itinerary images)
│   ├── /destinations/   (Destination guide banners)
│   └── /assets/         (Company logos, brochures)
│
└── Bucket: flyora-private (No public access, Presigned URLs with 15-min expiry)
    ├── /receipts/       (Uploaded payment proofs: IMPS/NEFT slips, UPI screenshots)
    ├── /documents/      (Customer passport scans, visa copies)
    └── /quotes/         (Generated PDF quotation archives)
```

---

## 5. Proposed Monorepo Directory Structure

```text
flyora/
├── apps/
│   ├── web/                              # Public SEO Website (Next.js 16 App Router)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx              # Homepage (Hero, Featured Tours, Services, Reviews)
│   │   │   │   ├── tours/                # Tour Package listings & dynamic [slug] pages
│   │   │   │   ├── services/             # Visas, Flights, Umrah, Holiday pages
│   │   │   │   ├── destinations/         # Destination hubs
│   │   │   │   ├── quote/[token]/        # Public shareable quote page for customers
│   │   │   │   ├── api/                  # Turnstile verification / revalidation webhooks
│   │   │   │   └── sitemap.ts            # Auto-generated XML sitemap
│   │   │   ├── components/               # TourCard, EnquiryModal, WhatsAppCTA, Header, Footer
│   │   │   └── lib/                      # API client, SEO metadata utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── admin/                            # Staff & Coordinator Portal (Vite + React TS)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx             # Staff authentication
│   │   │   │   ├── Dashboard.tsx         # High-level stats (Admin vs Coordinator view)
│   │   │   │   ├── Leads/                # Lead inbox, kanban/table, lead details
│   │   │   │   ├── Quotations/           # Quote builder, margin guard check, revision history
│   │   │   │   ├── Bookings/             # Confirmed bookings, traveller details
│   │   │   │   ├── Payments/             # Payment verification, receipt viewer
│   │   │   │   ├── Catalog/              # Packages & Services content manager
│   │   │   │   └── Settings/             # Team management, role/service skills assignment
│   │   │   ├── components/               # LeadTable, QuoteModal, StatusBadge, ReceiptViewer
│   │   │   ├── hooks/                    # useLeads, useQuotations, useServices (TanStack Query)
│   │   │   ├── stores/                   # authStore, filterStore, quoteDraftStore (Zustand)
│   │   │   └── lib/                      # API client, R2 direct upload helper
│   │   ├── index.html
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                              # Fastify REST API
│       ├── src/
│       │   ├── plugins/                  # Fastify plugins (cors, jwt, prisma, r2Storage)
│       │   ├── modules/
│       │   │   ├── auth/                 # Login, refresh tokens, profile, password reset
│       │   │   ├── users/                # Staff CRUD, roles, user_services coordinator skills
│       │   │   ├── services/             # Services catalog (Holidays, Visas, Flights, Umrah)
│       │   │   ├── packages/             # Tour packages & destination management
│       │   │   ├── leads/                # Lead intake, service-based assignment, status pipeline
│       │   │   ├── quotes/               # Quote builder, margin calculation, tokenized share links
│       │   │   ├── bookings/             # Booking creation & fulfilment tracker
│       │   │   ├── payments/             # Manual payment log, receipt uploads, approval
│       │   │   └── storage/              # R2 presigned URLs, upload handlers
│       │   ├── middleware/               # authenticate, requireRole, checkServiceAccess
│       │   ├── cron/                     # Simple node-cron tasks (daily summary / cleanup)
│       │   └── server.ts                 # Fastify app bootstrap
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/                         # Prisma ORM & Database Layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Unified PostgreSQL schema
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts                  # Exported PrismaClient singleton
│   │   └── package.json
│   │
│   ├── types/                            # Shared TypeScript Definitions
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── lead.ts
│   │   │   ├── quote.ts
│   │   │   ├── booking.ts
│   │   │   └── service.ts
│   │   └── package.json
│   │
│   └── validators/                       # Shared Zod Schemas
│       ├── src/
│       │   ├── leadSchema.ts             # Enquiry validation
│       │   ├── quoteSchema.ts            # Quotation & item breakdown validation
│       │   ├── paymentSchema.ts          # Payment entry validation
│       │   └── authSchema.ts
│       └── package.json
│
├── docs/                                 # Project Specifications & Guides
│   ├── ARCHITECTURE_AND_TECH_STACK.md
│   ├── MODULE_IMPLEMENTATION_PLAN.md
│   └── CHECKLIST.md
│
├── package.json                          # Monorepo root workspace configuration
├── turbo.json                            # Turborepo task pipeline configuration
└── tsconfig.base.json
```
