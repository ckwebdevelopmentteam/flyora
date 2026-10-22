# Flyora Travels — Developer 2 Module 2 Master Plan & Checklist

## Tour Packages Catalog, Day-by-Day Itinerary Builder & Cloudflare R2 Uploads

**Owner:** Developer 2 (Frontend Admin Portal & Content Management)  
**Target Workspace:** `apps/admin`  
**Git Branch:** `sahil` (tracking `origin/develop`)  
**Backend API Target:** `http://localhost:5000/api/v1`  
**Design Standard:** Strict Off-White Minimalist (`#F8F8F6` canvas, `#FFFFFF` cards, `#000000` solid black CTAs, `#E4E4E7` borders, `#71717A` ash text)  
**Status:** Completed & Verified — 0 Errors

---

## 1. Architecture & API Contracts Overview

### Shared Types (`@flyora/types`)

- `PackageSummary`: id, serviceId, serviceName, title, slug, durationDays, durationNights, destination, startingPrice, coverImageUrl, isFeatured, isPublished, createdAt
- `PackageDetails`: extends `PackageSummary` with `galleryImageUrls`, `overview`, `itinerary: ItineraryDay[]`, `inclusions`, `exclusions`, `metaTitle`, `metaDescription`, `keywords`, `updatedAt`
- `ItineraryDay`: `day: number`, `title: string`, `description: string`, `meals?: string`, `stay?: string`
- `PaginatedPackages`: `items`, `total`, `page`, `limit`, `totalPages`

### Shared Validation (`@flyora/validators`)

- `createPackageSchema`, `updatePackageSchema`, `packageFilterSchema`, `itineraryDaySchema`

### Backend Endpoints Available (`apps/api`)

- `GET /api/v1/packages` — Paginated list with filters (`serviceId`, `destination`, `search`, `page`, `limit`)
- `GET /api/v1/packages/:slug` — Single package details
- `POST /api/v1/packages` — Create package (Requires `SUPER_ADMIN`, `CONTENT_MANAGER`, `OPERATIONS_MANAGER`)
- `PUT /api/v1/packages/:id` — Update package
- `DELETE /api/v1/packages/:id` — Delete package (Requires `SUPER_ADMIN`)
- `POST /api/v1/storage/upload-url` — Generates Cloudflare R2 presigned PUT URL + publicUrl

---

## 2. Brick-by-Brick Implementation Phases

### Phase 1: API Services & Type Adapters

- [x] **1.1. Package API Client (`apps/admin/src/lib/packagesApi.ts`)**
  - [x] Implement `fetchPackages(filters)` calling `GET /api/v1/packages`
  - [x] Implement `fetchPackageBySlug(slug)` calling `GET /api/v1/packages/:slug`
  - [x] Implement `createPackage(payload)` calling `POST /api/v1/packages`
  - [x] Implement `updatePackage(id, payload)` calling `PUT /api/v1/packages/:id`
  - [x] Implement `deletePackage(id)` calling `DELETE /api/v1/packages/:id`
  - [x] Implement `getR2UploadUrl(filename, contentType, folder)` calling `POST /api/v1/storage/upload-url`
  - [x] Implement `uploadToR2(presignedUrl, file)` direct PUT upload with progress

### Phase 2: Cloudflare R2 Direct Uploader Component

- [x] **2.1. R2 Direct Dropzone (`apps/admin/src/components/packages/R2ImageDropzone.tsx`)**
  - [x] Drag-and-drop & file picker support (`image/jpeg`, `image/png`, `image/webp`)
  - [x] Request presigned URL from backend and stream binary PUT directly to R2
  - [x] Progress bar / uploading spinner state
  - [x] Live preview thumbnail with remove button
  - [x] Cover image mode (single file) vs Gallery mode (multi-file repeater)

### Phase 3: Packages Catalog Table Screen

- [x] **3.1. Catalog Page (`apps/admin/src/pages/PackagesListPage.tsx`)**
  - [x] TanStack Table showing:
    - Cover image thumbnail
    - Title & Destination
    - Duration badge (e.g. `5D / 4N`)
    - Service category tag
    - Starting price in ₹
    - Status pills: Published / Draft, Featured badge
    - Quick actions: Edit, Delete, View
  - [x] Search input by title or destination
  - [x] Filter dropdowns by Service Category and Status
  - [x] Minimal off-white design with empty state and skeleton loaders
  - [x] "New Package" button linking to `/packages/new`

### Phase 4: Package & Itinerary Builder Multi-Tab Form

- [x] **4.1. Builder Page (`apps/admin/src/pages/PackageBuilderPage.tsx`)**
  - [x] Supports both Create mode (`/packages/new`) and Edit mode (`/packages/edit/:slug`)
  - [x] Tab Navigation:
    - **Tab 1: Basic Information**
      - Title, slug generator, destination, service dropdown (from `/services`)
      - Duration (Days & Nights), starting price in ₹
      - Overview textarea
      - Published and Featured switches
    - **Tab 2: Media & Gallery (Cloudflare R2)**
      - Cover Image slot (Single R2 direct upload)
      - Gallery Images grid (Multi R2 direct upload with delete)
    - **Tab 3: Day-by-Day Itinerary Builder**
      - Dynamic repeater using `useFieldArray`
      - Auto-numbered Day cards with Title, Description, Meals, and Hotel/Stay
      - Add Day, Delete Day, Move Up/Down controls
    - **Tab 4: Inclusions & Exclusions**
      - Interactive tag adder for Inclusions
      - Interactive tag adder for Exclusions
      - Quick preset chips (e.g., "Airport Transfers", "Daily Breakfast", "Visa Assistance")
    - **Tab 5: SEO & SERP Preview**
      - Meta Title (with length meter)
      - Meta Description (with length meter)
      - Search keywords tag manager
      - Live Google Search Snippet preview card
  - [x] Form submission handler with toast feedback and redirect back to `/packages`

### Phase 5: Navigation & Route Registration

- [x] **5.1. Sidebar Navigation (`apps/admin/src/components/layout/Sidebar.tsx`)**
  - [x] Activate "Tour Packages" nav item with `Palmtree` icon
  - [x] Route link to `/packages`
- [x] **5.2. Router Setup (`apps/admin/src/App.tsx`)**
  - [x] Register `/packages` route
  - [x] Register `/packages/new` route
  - [x] Register `/packages/edit/:slug` route
  - [x] Wrap in `RoleGuard` allowing `SUPER_ADMIN`, `CONTENT_MANAGER`, `OPERATIONS_MANAGER`

### Phase 6: End-to-End Validation & Merge Gate

- [x] **6.1. Build & Lint Verification**
  - [x] `npm --prefix apps/admin run build` passes with 0 errors
  - [x] `npm run build` passes across all 6 workspace packages
  - [x] `npm run lint` passes across workspace
- [x] **6.2. Functional Integration Test**
  - [x] Login as Super Admin (`admin@flyora.com`)
  - [x] Create package via API & UI contracts ("5D/4N Dubai Family Luxury")
  - [x] Presigned R2 storage upload URL verified
  - [x] 5-day itinerary, inclusions, exclusions, and SEO tags verified
  - [x] Package retrievable via `GET /api/v1/packages/5d-4n-dubai-family-luxury`
  - [x] Package listing verified via `GET /api/v1/packages`
