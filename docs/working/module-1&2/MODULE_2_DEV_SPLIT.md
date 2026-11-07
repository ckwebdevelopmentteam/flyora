# Module 2 & 7: Tour Packages Catalog & Cloudflare R2 Storage — 2-Developer Work Split

**Goal:** Build the Tour Packages & Destination Catalog with dynamic day-by-day itineraries and direct photo gallery uploads powered by **Cloudflare R2** ($0 egress costs).

---

## 1. Work Allocation Matrix

```
┌────────────────────────────────────────────────────────┐
│ STEP 0: Base Contracts (Dev 1 creates, Dev 2 approves) │
│ Package Types + Zod Schemas                            │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ DEV 1: Backend & R2     │ │ DEV 2: Frontend (Admin) │
│ [PARALLEL WORK]         │ │ [PARALLEL WORK]         │
│ • Cloudflare R2 plugin  │ │ • Packages Table UI     │
│ • Presigned upload URLs │ │ • Itinerary Builder UI  │
│ • Packages CRUD API     │ │ • Inclusions/Exclusions │
│ • Slug & SEO handlers   │ │ • Direct R2 Uploader    │
└────────────┬────────────┘ └────────────┬────────────┘
             │                           │
             └─────────────┬─────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ INTEGRATION & PR GATE                                  │
│ Dev 2 connects Admin Package Form to Dev 1 API & R2    │
│ Test: Upload tour photo -> saves to R2 -> package live │
└────────────────────────────────────────────────────────┘
```

---

## 2. Developer 1 Checklist (Backend & Cloudflare R2)

### Branch Name: `feat/m2-packages-r2-api`

#### Step 1: Shared Contracts (`packages/types` & `packages/validators`)

- [x] Define `PackageDetails`, `ItineraryDay` in `packages/types/src/package.ts`.
- [x] Define `createPackageSchema`, `updatePackageSchema` in `packages/validators/src/packageSchema.ts`.
- [x] Export from root package indexes.

#### Step 2: Cloudflare R2 Storage Service (`apps/api/src/modules/storage`)

- [x] Set up `@aws-sdk/client-s3` client configured with Cloudflare R2 endpoint:
  ```text
  endpoint: https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
  region: auto
  ```
- [x] `POST /api/v1/storage/upload-url`:
  - Request: `{ filename, contentType, folder: "packages" | "destinations" }`
  - Generates presigned `PutObjectCommand` URL (valid for 15 minutes).
  - Returns: `{ uploadUrl, publicUrl, fileKey }`.
- [x] `GET /api/v1/storage/download-url`:
  - Generates presigned `GetObjectCommand` URL for private files with 15-min expiration.

#### Step 3: Packages API Endpoints (`apps/api/src/modules/packages`)

- [x] `GET /api/v1/packages`:
  - Public listing with pagination.
  - Query filters: `serviceId`, `destination`, `minPrice`, `maxPrice`, `search`, `featuredOnly`.
- [x] `GET /api/v1/packages/:slug`:
  - Public single package view with full itinerary, inclusions, and SEO metadata.
- [x] `POST /api/v1/packages`:
  - Admin & Content Manager only (`requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER', 'OPERATIONS_MANAGER'])`).
  - Auto-generate unique slug if not provided.
  - Store structured JSON itinerary.
- [x] `PUT /api/v1/packages/:id`:
  - Update details, itinerary days, prices, and gallery images.
- [x] `DELETE /api/v1/packages/:id`:
  - Delete package.

---

## 3. Developer 2 Checklist (Frontend Admin Package Catalog)

### Branch Name: `feat/m2-packages-admin-ui` (or `sahil`)

#### Step 1: Packages List Screen (`/packages`)

- [x] Filterable table showing:
  - Thumbnail preview, Package Title, Destination, Duration (e.g. 5D/4N).
  - Service tag (e.g. _Holiday Packages_, _Umrah_).
  - Starting Price (₹).
  - Published / Featured toggle switches.
- [x] "Add New Package" button leading to the creator form.

#### Step 2: Package & Itinerary Builder Form (`/packages/new` & `/edit/:slug`)

- [x] **Tab 1: Basic Information:**
  - Package Title, Destination, Duration (Days & Nights), Service selector dropdown, Starting Price.
  - Overview / Tour Summary text area.
- [x] **Tab 2: Photo Gallery & Cover (Cloudflare R2 Direct Upload):**
  - Dropzone for Cover Image and Gallery Images.
  - Direct R2 upload workflow:
    1. Client calls `/api/v1/storage/upload-url`.
    2. Uploads file directly to Cloudflare R2 via presigned PUT.
    3. Displays live image preview.
- [x] **Tab 3: Day-by-Day Itinerary Builder:**
  - Dynamic array repeater:
    - Day 1: Title (e.g., "Arrival & Dhow Cruise Dinner"), Description.
    - Day 2: Title (e.g., "Dubai City Tour & Burj Khalifa"), Description.
    - "Add Day" button.
- [x] **Tab 4: Inclusions & Exclusions:**
  - Tag-input for inclusions (Flights, 4-Star Hotel, Daily Breakfast, Visa, Airport Transfers).
  - Tag-input for exclusions (Personal expenses, Tips).
- [x] **Tab 5: SEO & OpenGraph:**
  - Meta Title, Meta Description, SEO Keywords.

---

## 4. Parallel Work vs. Waiting Points

| Task Item                    | Dev 1 (Backend)                            | Dev 2 (Frontend)                     |        Can Work in Parallel?         |
| :--------------------------- | :----------------------------------------- | :----------------------------------- | :----------------------------------: |
| **Package Contracts**        | Pushes `package.ts` and `packageSchema.ts` | Imports types into Admin             | ⏳ **Dev 2 waits 30 mins for types** |
| **Cloudflare R2 & Uploader** | Builds presigned URL API                   | Builds Image Dropzone & Preview UI   |         ✅ **100% Parallel**         |
| **Packages CRUD & Form**     | Writes Fastify controllers & DB queries    | Builds 5-tab Itinerary Form UI       |         ✅ **100% Parallel**         |
| **End-to-End Test**          | Verifies R2 upload & DB record             | Creates complete package with photos |      ⏳ **Together at PR Gate**      |

---

## 5. PR & Merge Gate (Exit Criteria for Module 2)

- [x] **PR 2.1 (Dev 1):** Fastify packages API and Cloudflare R2 upload endpoints merged into `develop`.
- [x] **PR 2.2 (Dev 2):** Admin Package Catalog and Itinerary Builder merged into `develop`.
- [x] **Joint Verification:**
  - Super Admin opens Admin dashboard.
  - Creates a package (e.g. _"5D/4N Dubai Family Luxury"_).
  - Uploads cover image to Cloudflare R2.
  - Adds 5-day itinerary, inclusions, and saves.
  - Package is retrievable via `GET /api/v1/packages/5d-4n-dubai-family-luxury`.
- [x] `npm run build` passes with 0 errors across all 6 packages.
