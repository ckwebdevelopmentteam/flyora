# Dev 1 (Admin & Backend Closer) — Module 7 Implementation Checklist

**Role:** Fullstack / Admin Specialist (Fastify, Prisma, React, Vite, TypeScript, Tailwind CSS, TanStack Query)  
**Strict Boundaries:** ONLY touch `apps/admin/src/pages/DashboardPage.tsx`, `apps/admin/src/pages/quotes/QuotesPage.tsx`, `apps/admin/src/pages/quotes/quotesApi.ts`, `apps/admin/src/App.tsx`, `apps/admin/src/components/layout/Sidebar.tsx`, and `apps/api/src/modules/dashboard/`. NEVER touch `apps/web/**`.

---

## Architecture & Design Standard

- **Design System:** Consistent with Admin tokens: `#F8F8F6` canvas, rich neutral borders, subtle glassmorphism, emerald revenue indicators, amber alert badges, and monospace figures.
- **State Management:** TanStack Query (`@tanstack/react-query`) with caching, refetch on window focus, and optimistic updates.
- **Testing:** Unit tests for metric formatters and component integration tests with Vitest.

---

## Step-by-Step Execution Plan

### Step 1: Dashboard Aggregation API (`apps/api`)

- [ ] Create `apps/api/src/modules/dashboard/dashboard.service.ts`:
  - **`getDashboardMetrics(userRole, userId)`:**
    - Query active leads count and unclaimed pool leads count (`assignedToId = null`).
    - Query quotation counts by status (`DRAFT`, `SENT`, `ACCEPTED`, `EXPIRED`) and count quotes flagged below minimum margin threshold.
    - Query booking totals: sum of `totalAmount`, sum of `paidAmount` (verified payments), sum of `dueAmount`.
    - Query recent activity feed (last 10 events: new leads, quotes sent, bookings confirmed).
- [ ] Create `apps/api/src/modules/dashboard/dashboard.controller.ts`:
  - `GET /api/v1/dashboard/metrics` (Authenticated staff, role-aware).
  - Register route plugin in `apps/api/src/server.ts`.
- [ ] Verify endpoint with `npm run build --workspace=@flyora/api`.

---

### Step 2: Live Executive Admin Dashboard (`apps/admin/src/pages/DashboardPage.tsx`)

- [ ] Replace static mock data with live React Query hook: `useQuery({ queryKey: ["dashboardMetrics"], queryFn: fetchDashboardMetrics })`.
- [ ] **Financial & Operational KPI Cards:**
  - 💼 **Unclaimed Pool Leads:** With direct link to `/leads?tab=pool` and high-priority pulse indicator.
  - 📄 **Active Quotations & Win Rate:** Total active quotes and conversion rate percentage.
  - 💰 **Cash Collected & Outstanding Balance:** Visual gauge showing verified collections vs remaining receivables.
  - ✈️ **Active Bookings:** Confirmed bookings with upcoming departures.
- [ ] **Coordinator Shift & Availability Widget:**
  - Fast toggle for coordinator availability (`AVAILABLE`, `BUSY`, `OFF_DUTY`).
- [ ] **Recent Operations Activity Stream:**
  - Real-time list of latest bookings, payments recorded, and newly claimed leads.

---

### Step 3: Dedicated Quotations Management Page (`apps/admin/src/pages/quotes/QuotesPage.tsx`)

- [ ] Create `apps/admin/src/pages/quotes/QuotesPage.tsx`:
  - **Metrics Bar:** Total Quotes, Accepted, Pending Customer Review, Low Margin Warnings.
  - **Filter Tabs:** All, Sent, Accepted, Expired, Below Margin Threshold.
  - **Search & Sort:** Search by Quote Number, Customer Name, Phone, Destination.
  - **Data Table:**
    - Quote Number pill (`Q-2026-XXXX`).
    - Customer Name & Service Category.
    - Selling Price vs Supplier Cost.
    - Margin Guard Badge: Emerald pill for safe margin, Crimson warning pill with tooltip if `< service.minMarginPercent`.
    - Status Badge: `DRAFT`, `SENT`, `ACCEPTED`, `EXPIRED`.
    - Expiry countdown / validity date.
    - Actions: Copy Public Shareable Link (`/quote/[token]`), Open Lead Drawer, Convert to Booking.
- [ ] Wire `/quotes` route into `apps/admin/src/App.tsx`.
- [ ] Update `apps/admin/src/components/layout/Sidebar.tsx` to set `path: "/quotes"`, `active: true`, remove the "P4" badge.

---

### Step 4: Verification & Automated Tests

- [ ] Write `QuotesPage.test.tsx` verifying:
  - Table renders quote items correctly.
  - Status filters properly filter the table rows.
  - Margin Guard crimson pill displays when quote margin is below threshold.
- [ ] Run `npm run test --workspace=@flyora/admin` to ensure 100% test pass rate.
- [ ] Run `npm run build --workspace=@flyora/admin` to confirm Vite build completes with 0 errors.
