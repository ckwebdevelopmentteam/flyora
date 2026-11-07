# Dev 2 (Public Web Homepage Specialist) — Module 7 Implementation Checklist

**Role:** Public Web Frontend & UI Specialist (Next.js 16, React 19, Tailwind CSS, Lucide Icons, Modern Typography & Micro-animations)  
**Strict Boundaries:** ONLY touch `apps/web/src/app/page.tsx`, `apps/web/src/components/home/**`, `apps/web/src/components/layout/Navbar.tsx`, and `apps/web/src/components/layout/Footer.tsx`. NEVER touch `apps/admin/**`, `apps/api/**`, or other web routes (`/tours`, `/services`).

---

## Architecture & Visual Aesthetics Standard

- **Design Philosophy:** Luxury travel agency aesthetics (warm ivory/cream canvas `#FAFAF7`, rich obsidian slate `#121212`, warm champagne gold accents `#C5A880`, subtle emerald trust badges).
- **Typography:** Modern, clean, and elegant typography with crisp contrast and generous whitespace.
- **Conversion Philosophy:** Every section must have a friction-free conversion trigger — either a quick inquiry popup or a click-to-WhatsApp button with contextual pre-filled messages.
- **Mobile First:** Over 75% of travel inquiries occur on mobile phones; mobile layout, tap targets, and sticky action bars must be flawless.

---

## Step-by-Step Execution Plan

### Step 1: Luxury Navigation Bar (`Navbar.tsx`)

- [ ] Create/Refine `apps/web/src/components/layout/Navbar.tsx`:
  - Branded Flyora Travels logo with gold accent emblem.
  - Desktop Navigation links: "Tour Packages", "Visas", "Flights", "Umrah", "Why Flyora", "About Us".
  - Quick Contact Header: Direct Phone Number + WhatsApp icon button.
  - **"Plan My Trip" CTA Button:** Prominent pill button triggering the quick inquiry modal.
  - Mobile Hamburger Menu with smooth slide-in drawer and direct contact buttons.

---

### Step 2: Cinematic Hero & Interactive Travel Search Widget (`HeroSection.tsx`)

- [ ] Create `apps/web/src/components/home/HeroSection.tsx`:
  - Engaging hero background with subtle overlay gradient for crystal-clear text readability.
  - Compelling H1 headline: _"Handcrafted Journeys, Unforgettable Memories"_ / _"Custom Luxury Holidays & Effortless Travel Services"_.
  - Trust badge ribbon: _"⭐ 4.9/5 Rating by 1,200+ Travelers • Dedicated Trip Coordinator • Zero Hidden Fees"_.
- [ ] Create `apps/web/src/components/home/TravelSearchBar.tsx`:
  - Floating card elevated over the hero fold.
  - Filter controls:
    - **Destination / Keyword Input:** e.g. "Dubai, Maldives, Baku, Bali, Switzerland".
    - **Travel Month / Season:** Dropdown selector.
    - **Budget Range Selector:** Budget, Comfort, Luxury.
    - **Service Category Tabs:** "Holiday Packages", "Fast Visa", "Flights", "Umrah".
  - **"Explore Packages" CTA:** Directs to `/tours` with active query parameters.

---

### Step 3: Core Travel Services Showcase Hub (`ServicesShowcase.tsx`)

- [ ] Create `apps/web/src/components/home/ServicesShowcase.tsx`:
  - 5 dedicated, beautifully styled service cards:
    1. 🌴 **Custom Holidays & Honeymoons:** Private itineraries, 4/5-star boutique stays, personalized excursions.
    2. 🛂 **Fast-Track International Visas:** 99.2% approval assistance for Dubai, Schengen, UK, Singapore, Malaysia.
    3. ✈️ **Flight Ticketing & Fare Locks:** Competitive international fares and group booking desk.
    4. 🕋 **Umrah & Hajj Services:** Guided spiritual journeys with premium hotel proximity.
    5. 🏨 **Luxury Hotels & Resorts:** Handpicked properties with complimentary breakfast & transfers.
  - Each card features:
    - Custom icon / photographic accent.
    - Key bullet points (e.g., "Documentation Support", "Express 72h Processing").
    - Action buttons: "View Details" (links to `/services/[slug]`) and "Quick Inquiry" (opens enquiry modal).

---

### Step 4: Curated & Trending Tour Packages Grid (`FeaturedTours.tsx`)

- [ ] Create `apps/web/src/components/home/FeaturedTours.tsx`:
  - Fetch or present featured tour packages with responsive 3-column grid.
  - **Tour Package Cards:**
    - High-resolution hero image with badge (e.g. _"Best Seller"_, _"Trending"_).
    - Destination pill & duration tag (`5 Days / 4 Nights`).
    - Key inclusions pill bar (✈️ Flights, 🏨 4★ Hotel, 🚗 Transfers, 📄 Visa).
    - Clear pricing: _"From ₹42,000 / person"_.
    - **Dual Action Buttons:**
      - "View Itinerary" (links to `/tours/[slug]`).
      - "Chat on WhatsApp" (opens WhatsApp with pre-filled text: `"Hi Flyora, I'm interested in the [Package Name] package. Please send itinerary and quote."`).

---

### Step 5: Trust, Authority & Customer Testimonials (`TrustSection.tsx`)

- [ ] Create `apps/web/src/components/home/TrustSection.tsx`:
  - 4 Pillars of Flyora:
    1. 🛡️ **Zero Booking Surprises:** Itemized transparent quotes with no hidden charges.
    2. 👤 **1-on-1 Personal Coordinator:** You speak to the same experienced travel executive from inquiry to return flight.
    3. ⚡ **Lightning Fast Visas & Flights:** Verified documentation checks before submission.
    4. 🛎️ **24/7 On-Trip Emergency Concierge:** Real-time support via WhatsApp during your travel.
- [ ] Create `apps/web/src/components/home/CustomerTestimonials.tsx`:
  - Real customer reviews carousel or masonry cards with traveler names, destination visited, and ratings.

---

### Step 6: Sticky Mobile Action Bar & Global Footer (`Footer.tsx`)

- [ ] Create `apps/web/src/components/home/MobileActionBar.tsx`:
  - Fixed bottom bar appearing on mobile screens (`sm:hidden`).
  - Dual action layout:
    - 📞 **"Call Us"** button (initiates direct phone call).
    - 💬 **"WhatsApp Coordinator"** button (high-contrast emerald, opens WhatsApp chat).
- [ ] Create `apps/web/src/components/layout/Footer.tsx`:
  - Company overview, licensing & IATA credentials disclaimer.
  - Quick links to services, popular destinations, and terms.
  - Emergency contact details, office location, and social links.

---

### Step 7: Verification & Responsiveness

- [ ] Verify homepage layout across screen widths:
  - Mobile: 360px, 390px, 414px.
  - Tablet: 768px, 1024px.
  - Desktop: 1280px, 1440px, 1920px.
- [ ] Run `npm run build --workspace=@flyora/web` to confirm Next.js Turbopack compiles cleanly with 0 TypeScript or linting errors.
