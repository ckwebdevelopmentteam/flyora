# Dev 3 (Public Web Catalog, Itinerary & Services Specialist) — Module 7 Implementation Checklist

**Role:** Public Web Frontend & SEO Specialist (Next.js 16, React 19, Tailwind CSS, Lucide Icons, Schema.org JSON-LD)  
**Strict Boundaries:** ONLY touch `apps/web/src/app/tours/**`, `apps/web/src/app/services/**`, `apps/web/src/components/tours/**`, `apps/web/src/components/services/**`, `apps/web/src/app/sitemap.ts`, and `apps/web/src/app/robots.ts`. NEVER touch `apps/web/src/app/page.tsx`, `apps/web/src/components/home/**`, `apps/admin/**`, or `apps/api/**`.

---

## Architecture & Visual Standards

- **Visual Consistency:** Matches the luxury ivory/obsidian aesthetic established in Flyora Web.
- **Deep Content Presentation:** Tour detail pages must present rich, structured information (itineraries, hotel specs, flight inclusions) without visual clutter.
- **WhatsApp Integration:** Every tour and service page must have pre-filled WhatsApp actions so customers can inquire with zero typing.
- **Search Engine Optimization (SEO):** Clean semantic HTML5, dynamic OpenGraph preview images, and schema.org structured data for travel agencies and tourist trips.

---

## Step-by-Step Execution Plan

### Step 1: Tour Packages Discovery Catalog (`/tours`)

- [ ] Create `apps/web/src/app/tours/page.tsx`:
  - Server-side data fetching from `GET /api/v1/packages`.
  - Header with breadcrumbs (`Home / Tour Packages`) and filter summary.
- [ ] Create `apps/web/src/components/tours/TourFilterSidebar.tsx`:
  - **Category Pills:** "All", "International Holidays", "Domestic", "Umrah & Spiritual", "Honeymoon".
  - **Destination Filter:** Checkboxes for top destinations (Dubai, Maldives, Bali, Thailand, Europe, Turkey).
  - **Duration Filter:** "1-3 Days", "4-7 Days", "8+ Days".
  - **Budget Range Slider:** Dynamic price filtering.
  - Mobile Filter Sheet (collapsible drawer on mobile devices).
- [ ] Create `apps/web/src/components/tours/TourCatalogGrid.tsx`:
  - Responsive 3-column grid of tour package cards.
  - Sort dropdown: "Recommended", "Price: Low to High", "Price: High to Low", "Duration".
  - Empty state with "Reset Filters" CTA.

---

### Step 2: Luxury Tour Details Page (`/tours/[slug]`)

- [ ] Create `apps/web/src/app/tours/[slug]/page.tsx`:
  - Fetch package details via `GET /api/v1/packages/:slug`.
  - Not found handling (`404` page if package slug does not exist).
- [ ] Create `apps/web/src/components/tours/TourPhotoGallery.tsx`:
  - Grid gallery with primary hero photo and secondary gallery thumbnails (stored on Cloudflare R2).
  - Lightbox / full-screen photo viewer modal.
- [ ] Create `apps/web/src/components/tours/DayWiseItinerary.tsx`:
  - Interactive day-by-day accordion / timeline:
    - Day number pill (`Day 01`, `Day 02`).
    - Title & activity breakdown (e.g. _Day 1: Arrival in Dubai & Marina Dhow Cruise_).
    - Meal inclusions tags (🍳 Breakfast, 🍽️ Dinner).
    - Hotel stay details.
- [ ] Create `apps/web/src/components/tours/InclusionsExclusionsGrid.tsx`:
  - Two-column card:
    - **What's Included (Emerald checkmarks):** Flights, 4-Star Accommodations, Daily Breakfast, Sightseeing Tickets, Private Airport Transfers, Travel Insurance.
    - **What's Excluded (Muted crosses):** Personal expenses, Optional watersports, Visa processing fee (if optional).
- [ ] Create `apps/web/src/components/tours/StickyBookingWidget.tsx`:
  - Sticky card on desktop right sidebar & fixed bottom bar on mobile:
    - Transparent pricing breakdown: _"Starting from ₹45,000 / person"_.
    - Duration & departure city badge.
    - **"Chat with Coordinator on WhatsApp" CTA:**
      - Opens WhatsApp with contextual message:
        `"Hi Flyora Travels, I'm reviewing the package '[Package Title]' (Slug: [slug]). I'd like to get a customized quote for [X] adults traveling around [Date]."`
    - **"Request Customized Proposal" Button:** Opens enquiry modal with package pre-selected.

---

### Step 3: Service Landing Pages (`/services/[slug]`)

- [ ] Create `apps/web/src/app/services/[slug]/page.tsx`:
  - Support routes:
    - `/services/visa-assistance` (International Visas desk)
    - `/services/umrah-hajj` (Spiritual Umrah & Ziyarat packages)
    - `/services/flight-booking` (Corporate & International flights)
    - `/services/custom-holidays` (Bespoke itineraries)
  - Features:
    - Service hero banner with trust badges.
    - Step-by-step process timeline (_1. Document Verification $\to$ 2. Embassy Filing $\to$ 3. Visa Issuance_).
    - FAQ accordion for common traveler questions.
    - Dedicated service inquiry form that feeds directly into the coordinator pool.

---

### Step 4: SEO Architecture & Structured Data

- [ ] Implement `generateMetadata` on `/tours/[slug]` and `/services/[slug]`:
  - Dynamic meta title, description, and OpenGraph image preview.
  - Canonical URL tags.
- [ ] Add JSON-LD Structured Data:
  - `TouristTrip` schema on Tour Detail pages (duration, itinerary, destination, offer price).
  - `TravelAgency` and `BreadcrumbList` schema across pages.
- [ ] Create dynamic `apps/web/src/app/sitemap.ts`:
  - Automatically indexes static routes (`/`, `/tours`, `/services/*`) and dynamic tour slugs from API.
- [ ] Create `apps/web/src/app/robots.ts`:
  - Configured to allow indexing of public pages while disallowing private admin/quote/booking routes.

---

### Step 5: Verification & Tests

- [ ] Run `npm run build --workspace=@flyora/web` to ensure Next.js Turbopack compiles with 0 errors.
- [ ] Verify that all WhatsApp buttons correctly open `https://wa.me/` with URL-encoded messages.
- [ ] Verify responsive behavior on both mobile (390px) and wide desktop (1440px).
