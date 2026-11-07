# Module 7: Luxury Homepage, Public Tour Catalog, Services Hub & Admin Completion — 3-Developer Work Split

**Phase:** Phase 7 (Module 7)  
**Goal:** Deliver a high-converting, luxury public website (`apps/web`) with an impactful, top-tier Homepage, comprehensive Tour Catalog with detailed itineraries, specialized Service landing pages, SEO & structured data, and complete the remaining Admin Portal features (Live Metrics Dashboard & Quotations Management).

---

## 1. 🚨 Core Vision & Strategic Priorities

### 1.1 First Impression & Homepage "WOW" Factor

- In luxury and custom travel, **customer trust is won or lost in the first 5 seconds**.
- The homepage must immediately convey elegance, transparency, and competence.
- It must prominently feature all 5 core Flyora services:
  1. 🌴 **Tailor-Made Holidays & Honeymoons**
  2. 🛂 **Fast-Track International Visas** (Dubai, Schengen, UK, Singapore, etc.)
  3. ✈️ **Flight Ticketing & Fare Locks**
  4. 🕋 **Umrah & Hajj Packages**
  5. 🏨 **Luxury Hotel & Resort Bookings**
- **Zero Friction:** Direct WhatsApp buttons with pre-filled package context and instant 1-click inquiry modals ensure high conversion rates.

### 1.2 Separation of Concerns & Zero Merge Conflicts

To allow 3 developers to ship simultaneously at peak velocity without git collisions:

- **Dev 1 (Fullstack & Admin Closer):** Exclusively works on `apps/admin/` and `apps/api/` (Dashboard metrics aggregation & `/quotes` management page).
- **Dev 2 (Web Homepage Specialist):** Exclusively owns `apps/web/src/app/page.tsx` and `apps/web/src/components/home/**`.
- **Dev 3 (Web Catalog & Services Specialist):** Exclusively owns `apps/web/src/app/tours/**`, `apps/web/src/app/services/**`, `apps/web/src/components/tours/**`, and SEO (`sitemap.ts`, `robots.ts`).

---

## 2. Strict Developer Boundaries (Zero Merge Conflicts)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MODULE 7: 3-DEVELOPER WORK DISTRIBUTION                    │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│ DEV 1: ADMIN & BACKEND   │   │ DEV 2: HOMEPAGE "WOW"    │   │ DEV 3: TOURS & SERVICES  │
│ apps/admin               │   │ apps/web/src/app/page.tsx│   │ apps/web/src/app/tours/  │
│ apps/api                 │   │ apps/web/src/components/ │   │ apps/web/src/app/services│
│ • Live Dashboard Metrics │   │   home/**                │   │ apps/web/src/components/ │
│ • /quotes Table & Filters│   │ • Cinematic Hero & Search│   │   tours/** & services/** │
│ • Margin Guard Badges    │   │ • Services Showcase Hub  │   │ • /tours Catalog Grid    │
│ • Dashboard API Summary  │   │ • Curated Packages Grid  │   │ • /tours/[slug] Details  │
│                          │   │ • Trust & Testimonials   │   │ • Dynamic SEO & Sitemaps │
└──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
```

| Developer                          | Strict Directory Boundaries                                                                                                                                                                         | Files Never to Touch                                                                           |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Dev 1 (Admin & Backend)**        | `apps/admin/src/pages/DashboardPage.tsx`, `apps/admin/src/pages/quotes/QuotesPage.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/components/layout/Sidebar.tsx`, `apps/api/src/modules/dashboard/` | `apps/web/**`                                                                                  |
| **Dev 2 (Web Homepage)**           | `apps/web/src/app/page.tsx`, `apps/web/src/components/home/**`, `apps/web/src/components/layout/Navbar.tsx`, `apps/web/src/components/layout/Footer.tsx`                                            | `apps/admin/**`, `apps/api/**`, `apps/web/src/app/tours/**`, `apps/web/src/app/services/**`    |
| **Dev 3 (Web Catalog & Services)** | `apps/web/src/app/tours/**`, `apps/web/src/app/services/**`, `apps/web/src/components/tours/**`, `apps/web/src/components/services/**`, `apps/web/src/app/sitemap.ts`, `apps/web/src/app/robots.ts` | `apps/admin/**`, `apps/api/**`, `apps/web/src/app/page.tsx`, `apps/web/src/components/home/**` |

---

## 3. Dependency & Waiting Matrix

| Task                              | Owner     | Waiting Developer | Action to Prevent Idling                                                                                                                                                  |
| :-------------------------------- | :-------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Packages API Verification**     | Existing  | **Dev 2 & 3**     | Both Dev 2 & 3 can fetch packages via existing `GET /api/v1/packages` and `GET /api/v1/packages/:slug`. Dev 2 & 3 use shared interfaces in `@flyora/types`.               |
| **Dashboard Metrics API**         | **Dev 1** | **None**          | Dev 1 implements `GET /api/v1/dashboard/metrics` and wires it directly to Admin `DashboardPage.tsx`.                                                                      |
| **Public Homepage & Search**      | **Dev 2** | **None**          | Dev 2 implements the Hero, Search filter widget, Service Showcase cards, and Featured Tours. Links navigate to `/tours` and `/services/[slug]`.                           |
| **Tour Discovery & Detail Pages** | **Dev 3** | **None**          | Dev 3 implements `/tours` catalog with filters, `/tours/[slug]` with day-by-day itineraries, and service landing pages with custom enquiry forms.                         |
| **Joint E2E Flow Review**         | **All 3** | **None**          | Verify: Homepage search $\to$ Tour detail $\to$ WhatsApp inquiry $\to$ Lead captured in Admin pool $\to$ Quote created $\to$ Converted to booking $\to$ Customer voucher. |

---

## 4. Shared Contract & Data Specifications

### 4.1 Package Card Presentation Contract (`@flyora/types`)

```typescript
export interface PackageCardData {
  id: string;
  title: string;
  slug: string;
  destination: string;
  country: string;
  durationDays: number;
  durationNights: number;
  startingPrice: number;
  heroImageUrl: string;
  featured: boolean;
  serviceCategory: "HOLIDAYS" | "UMRAH" | "VISA" | "FLIGHTS";
  inclusions: string[]; // e.g. ["Flights", "4-Star Hotel", "Breakfast", "Transfers"]
}
```

### 4.2 Dashboard Metrics Contract

```typescript
export interface DashboardMetricsResponse {
  leads: {
    totalActive: number;
    unclaimedPool: number;
    convertedThisMonth: number;
  };
  quotes: {
    activeQuotes: number;
    pendingApproval: number; // Low margin flag
    conversionRatePercent: number;
  };
  bookings: {
    totalBookings: number;
    totalRevenue: number;
    verifiedPaidAmount: number;
    outstandingDueAmount: number;
  };
}
```

---

## 5. Exit Criteria & PR Gate Checklist

- [ ] **Dev 1 (Admin & Backend):**
  - [ ] `GET /api/v1/dashboard/metrics` returns real-time business aggregates.
  - [ ] `DashboardPage.tsx` displays live KPIs, financial summaries, and active team shifts.
  - [ ] `QuotesPage.tsx` active in `/quotes` with status filters, Margin Guard alerts, and quick preview drawer.
- [ ] **Dev 2 (Web Homepage):**
  - [ ] Luxury cinematic Hero section with headline and interactive multi-tab search widget.
  - [ ] Service Showcase Hub highlighting all 5 travel categories with direct inquiry triggers.
  - [ ] Featured Tour Packages grid with pricing, tags, and click-to-WhatsApp.
  - [ ] Why Flyora trust cards, traveler testimonials, and sticky mobile action bar.
- [ ] **Dev 3 (Web Catalog & Services):**
  - [ ] `/tours` responsive catalog with destination search, duration filter, and budget slider.
  - [ ] `/tours/[slug]` luxury itinerary page with photo gallery, day-wise timeline, and sticky inquiry drawer.
  - [ ] `/services/[slug]` landing pages for Visas, Umrah, and Flights.
  - [ ] Dynamic OpenGraph metadata, JSON-LD travel schema, `sitemap.xml`, and `robots.txt`.
- [ ] **Integration:** `npm run build` passes with 0 errors across the entire monorepo.
