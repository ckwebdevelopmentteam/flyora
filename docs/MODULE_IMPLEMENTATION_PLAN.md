# Flyora Travels — Module-Wise Implementation Plan

This document details the functional specifications, database models, and API interfaces for all core modules of the Flyora Travels system.

---

## Module 1: Authentication & Role-Based Access Control (RBAC)

### Objectives
Provide secure staff access with granular service specialization so that:
- **Super Admin & Operations Manager**: Can view all leads, all quotes, and assign/reassign leads across any service.
- **Service Coordinators (Sales Executives)**: Can see the pool for their assigned service (e.g. Visa, Holidays, Umrah) plus their own assigned leads.

### Core Data Models (Prisma)
```prisma
enum UserRole {
  SUPER_ADMIN
  OPERATIONS_MANAGER
  SERVICE_COORDINATOR
  CONTENT_MANAGER
  ACCOUNTS
}

enum StaffAvailability {
  AVAILABLE
  BUSY
  OFF_DUTY
}

model User {
  id           String            @id @default(uuid())
  email        String            @unique
  passwordHash String
  fullName     String
  phone        String?
  role         UserRole          @default(SERVICE_COORDINATOR)
  availability StaffAvailability @default(AVAILABLE)
  isActive     Boolean           @default(true)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  // Relations
  services     UserService[]
  assignedLeads Lead[]           @relation("AssignedLeads")
  createdQuotes Quotation[]
  paymentsRecorded Payment[]
  activities   LeadActivity[]
}

model Service {
  id          String        @id @default(uuid())
  name        String        @unique // e.g. "Holiday Packages", "Visa Assistance", "Flight Booking", "Umrah & Hajj", "Hotel Booking"
  slug        String        @unique
  description String?
  isActive    Boolean       @default(true)
  minMarginPercent Float    @default(10.0) // Margin guard floor

  coordinators UserService[]
  packages     Package[]
  leads        Lead[]
}

model UserService {
  id        String   @id @default(uuid())
  userId    String
  serviceId String
  isPrimary Boolean  @default(true)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([userId, serviceId])
}
```

### Key API Endpoints (Fastify)
- `POST /api/v1/auth/login` — Authenticate and return JWT access token + refresh token.
- `GET /api/v1/auth/me` — Return current user details, role permissions, and active service mappings.
- `GET /api/v1/users` — (Admin only) List all staff with their roles, availability, and assigned services.
- `POST /api/v1/users` — (Admin only) Create/Invite staff member and assign role + services.
- `PATCH /api/v1/users/:id/services` — (Admin only) Update coordinator's assigned services.
- `PATCH /api/v1/users/:id/availability` — (Staff) Toggle `AVAILABLE` | `BUSY` | `OFF_DUTY`.

---

## Module 2: Services & Tour Packages Catalog

### Objectives
Enable Content Managers and Admins to publish rich tour packages and services with itineraries, inclusions, pricing, and SEO metadata.

### Core Data Models
```prisma
model Package {
  id              String   @id @default(uuid())
  serviceId       String
  title           String   // e.g. "5D/4N Dubai Family Luxury Escape"
  slug            String   @unique
  durationDays    Int
  durationNights  Int
  destination     String   // e.g. "Dubai, UAE"
  startingPrice   Decimal  @db.Decimal(10, 2)
  coverImageUrl   String   // Cloudflare R2 Public URL
  galleryImageUrls String[] // Array of R2 Public URLs
  overview        String   @db.Text
  itinerary       Json     // Array of { day: 1, title: "", description: "" }
  inclusions      String[]
  exclusions      String[]
  isFeatured      Boolean  @default(false)
  isPublished     Boolean  @default(true)
  
  // SEO fields
  metaTitle       String?
  metaDescription String?
  keywords        String[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  service         Service  @relation(fields: [serviceId], references: [id])
  enquiries       Enquiry[]
}
```

### Key API Endpoints
- `GET /api/v1/packages` — Public list of published tour packages (filterable by service, destination, duration).
- `GET /api/v1/packages/:slug` — Public single package details with itinerary and SEO metadata.
- `POST /api/v1/packages` — (Admin/Content Manager) Create tour package.
- `PUT /api/v1/packages/:id` — (Admin/Content Manager) Update package & itinerary.
- `DELETE /api/v1/packages/:id` — (Admin/Content Manager) Unpublish/Delete package.

---

## Module 3: Simple "Take Lead" Pool & Service Coordinator Workflow

### The "Take Lead" (First-Come, First-Served) Model
As per real operations, there is **no complicated auto-assign algorithm**. Instead:
1. **Service Queue:** 
   - When a customer submits an enquiry for a service (e.g. *Visa Assistance*, *Holiday Packages*, *Flights*), the lead is created as `UNASSIGNED` (`assignedToId = null`) and tagged to that `serviceId`.
2. **Alert Notification to Service Coordinators & Admin:**
   - The owner assigns 2 or more coordinators per service, each with their phone/WhatsApp number.
   - When a new lead arrives, an instant alert with customer summary is dispatched to the phone numbers of the coordinators assigned to that specific service **and** the Admin.
3. **"Take Lead" Action in Dashboard:**
   - All coordinators assigned to that service see the lead in their **"Service Lead Pool"**.
   - Any available coordinator clicks **"Take Lead" / "Claim Lead"**.
   - **Atomic Concurrency:** The API verifies the lead is still unclaimed. The moment coordinator A clicks "Take Lead", `assignedToId` is locked to Coordinator A.
   - **Instant Disappear from Pool:** The lead immediately disappears from all other coordinators' pool views, and moves exclusively into Coordinator A's **"My Leads"** dashboard. Another coordinator cannot claim it.
4. **Direct Client Contact:**
   - The coordinator who claimed the lead calls or WhatsApps the client directly.
   - Coordinator updates status (`New` -> `Contacted` -> `Quoted` -> `Booked` -> `Lost`).
   - Adds internal notes (client budget, special requests, follow-up date).
5. **Admin Oversight:**
   - Admin has a master view of all leads across all services, can see who claimed which lead, and can manually re-assign any lead if a coordinator is busy or on leave.

### Core Data Models
```prisma
enum LeadStatus {
  NEW
  CONTACTED
  QUOTED
  NEGOTIATING
  BOOKED
  LOST
}

enum LeadSource {
  WEBSITE_FORM
  WHATSAPP_CLICK
  PHONE_CALL
  DIRECT_WALK_IN
}

model Customer {
  id        String    @id @default(uuid())
  fullName  String
  phone     String    @unique
  email     String?
  city      String?
  createdAt DateTime  @default(now())

  leads     Lead[]
}

model Lead {
  id              String      @id @default(uuid())
  customerId      String
  serviceId       String
  packageId       String?
  assignedToId    String?     // NULL = Unassigned in Service Pool; Set = Claimed by Coordinator
  claimedAt       DateTime?   // Timestamp when coordinator clicked "Take Lead"
  status          LeadStatus  @default(NEW)
  source          LeadSource  @default(WEBSITE_FORM)
  travelDate      DateTime?
  numberOfAdults  Int         @default(1)
  numberOfKids    Int         @default(0)
  estimatedBudget Decimal?    @db.Decimal(10, 2)
  followUpDate    DateTime?   // Simple follow-up reminder date
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  customer        Customer    @relation(fields: [customerId], references: [id])
  service         Service     @relation(fields: [serviceId], references: [id])
  package         Package?    @relation(fields: [packageId], references: [id])
  assignedTo      User?       @relation("AssignedLeads", fields: [assignedToId], references: [id])
  activities      LeadActivity[]
  quotations      Quotation[]
  booking         Booking?
}

model LeadActivity {
  id        String   @id @default(uuid())
  leadId    String
  userId    String
  action    String   // "CLAIMED_LEAD", "STATUS_CHANGE", "NOTE_ADDED", "CALL_LOGGED", "FOLLOW_UP_SET"
  details   String   @db.Text
  createdAt DateTime @default(now())

  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}
```

### Key API Endpoints
- `POST /api/v1/public/enquiry` — Public endpoint to submit enquiry (notifies service coordinator numbers + admin).
- `GET /api/v1/leads/pool` — Returns unassigned leads matching the logged-in coordinator's assigned service(s).
- `GET /api/v1/leads/my-leads` — Returns leads claimed by the logged-in coordinator.
- `GET /api/v1/leads/all` — (Admin & Manager) Returns all leads across all services with claim statuses.
- `POST /api/v1/leads/:id/take` — **Atomic Claim Action:**
  - Locks `assignedToId = req.user.id` and sets `claimedAt = new Date()`.
  - Returns `409 Conflict` if another coordinator already took the lead.
- `PATCH /api/v1/leads/:id/reassign` — (Admin only) Manually transfer lead to a different coordinator.
- `PATCH /api/v1/leads/:id/status` — Update status (`NEW` -> `CONTACTED` -> `QUOTED`, etc.).
- `POST /api/v1/leads/:id/notes` — Add internal note and optional `followUpDate`.

---

## Module 4: Coordinator Workspace & Daily Management

### Coordinator Dashboard View (Zero Complications)
- **Tab 1: Service Pool (Available to Claim):**
  - Shows incoming unassigned leads for the coordinator's service (e.g. *Visa Enquiries*).
  - Clean card/row showing: Customer Name, Destination/Service, Enquiry Date, and a prominent **"Take Lead"** button.
- **Tab 2: My Active Leads:**
  - Shows all leads claimed by this coordinator.
  - Filterable by simple stage: `All`, `Contacted`, `Quoted`, `Booked`, `Lost`.
- **Lead Detail Drawer:**
  - **Client Contact:** Click-to-Call or Click-to-WhatsApp directly from desktop or mobile.
  - **Quick Status Selector:** Dropdown to update current stage.
  - **Notes & Follow-up:** Quick text box to jot down client requests ("wants 5-star instead of 4-star; follow up on Friday") and save with timestamp.
  - **One-Click "Create Quote":** Opens Module 5 Quotation Builder pre-filled with this lead's details.

---

## Module 5: Quotation Builder & Margin Guard (Manual Rates Workflow)

### Clarification on Hotel & Flight Pricing (No Live APIs)
- **Zero Live Supplier APIs:** There are **NO live ticket or hotel room price feeds** (no GDS/Amadeus/Booking.com APIs).
- **Public Website Behavior:** Shows packages with indicative "Starting from" prices, or an "Enquire via Call / WhatsApp" button for customized trips.
- **Backend Coordinator Workflow:**
  1. Customer makes an enquiry (e.g. "Family of 4 to Dubai in December, 4-star hotel + flights from Mumbai").
  2. The assigned coordinator checks their offline supplier portals, contacts hotel/flight partners via phone/WhatsApp, and gets the exact net rates.
  3. The coordinator opens **Module 5: Quotation Builder** in the Admin dashboard and manually inputs each line item:
     - **Flight:** Airline, Sector, Manual Supplier Fare per person.
     - **Hotel:** Hotel Name, Room Category, Number of Nights, Manual Supplier Rate.
     - **Visa:** Visa Type, Processing Fee.
     - **Transfers / Sightseeing:** Vehicle type, Excursions, Net Cost.
  4. For each item, the coordinator enters:
     - **Supplier Cost (Net):** The exact amount Flyora pays to the airline/hotel/partner.
     - **Selling Price (Gross):** The amount quoted to the customer.

---

### Margin Guard Mechanism
$$\text{Margin Amount} = \text{Selling Price} - \text{Supplier Cost}$$
$$\text{Margin \%} = \left(\frac{\text{Margin Amount}}{\text{Selling Price}}\right) \times 100$$

- Each Service has a pre-configured **Minimum Margin %** (e.g., Holidays = 12%, Visas = 20%, Flights = 5%).
- **Margin Guard Behavior in UI:**
  - **Healthy Margin (Above target):** Highlighted in **Green**. Coordinator can generate and send the quote immediately.
  - **Low Margin (Below target):** Highlighted in **Amber/Red Warning**.
    - Prevents accidental under-pricing (e.g. coordinator entering ₹45,000 when cost is ₹44,000).
    - Requires either adjusting the selling price OR requires Operations Manager sign-off before sending.

---

### Step-by-Step Quotation Lifecycle

```
1. Coordinator checks offline rates (Call / WhatsApp to hotel/airline supplier)
                           │
                           ▼
2. Coordinator inputs items in Admin Quote Builder:
   - Flight: Net ₹22,000 -> Quoted ₹25,000
   - Hotel 4N: Net ₹28,000 -> Quoted ₹34,000
   - Visa & Tours: Net ₹15,000 -> Quoted ₹18,000
   -----------------------------------------------
   Total Cost: ₹65,000 | Total Price: ₹77,000 | Margin: ₹12,000 (15.5%)
                           │
                           ▼
3. Margin Guard checks: 15.5% >= 12% (Passed - Green)
                           │
                           ▼
4. Coordinator clicks "Generate Shareable Quote"
   - Generates unique web token: https://flyora.com/quote/fly-9823-x89
   - Copy-to-WhatsApp button: Pre-formats a WhatsApp message for the customer
                           │
                           ▼
5. Customer opens link on mobile:
   - Views branded itinerary, hotel details, flight summary, and total price
   - Clicks "Call to Confirm" or "Reply on WhatsApp"
                           │
                           ▼
6. Coordinator marks quote "Accepted" -> Converts to Booking (Module 6)
```

---

### Core Data Models
```prisma
enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

model Quotation {
  id           String      @id @default(uuid())
  leadId       String
  createdById  String
  quoteNumber  String      @unique // e.g. "FLY-2026-0042"
  version      Int         @default(1)
  status       QuoteStatus @default(DRAFT)
  shareToken   String      @unique @default(uuid()) // For public shareable link
  
  supplierCost Decimal     @db.Decimal(10, 2)
  sellingPrice Decimal     @db.Decimal(10, 2)
  marginAmount Decimal     @db.Decimal(10, 2)
  marginPercent Float
  
  // Array of manually entered items
  // [
  //   { type: "FLIGHT", title: "IndiGo BOM-DXB Return", supplierCost: 22000, sellingPrice: 25000, details: "20kg baggage" },
  //   { type: "HOTEL", title: "Novotel Al Barsha 4N", supplierCost: 28000, sellingPrice: 34000, details: "Deluxe Room with Breakfast" },
  //   { type: "VISA", title: "UAE 30-Day Tourist Visa", supplierCost: 7000, sellingPrice: 8500, details: "Express processing" },
  //   { type: "TRANSFER", title: "Airport Pick & Drop + Desert Safari", supplierCost: 8000, sellingPrice: 9500, details: "Private 4x4" }
  // ]
  items        Json
  inclusions   String[]
  exclusions   String[]
  validUntil   DateTime
  acceptedAt   DateTime?
  notes        String?     @db.Text
  createdAt    DateTime    @default(now())

  lead         Lead        @relation(fields: [leadId], references: [id])
  createdBy    User        @relation(fields: [createdById], references: [id])
  booking      Booking?
}
```

### Shareable Customer Quote Link (`apps/web/src/app/quote/[token]/page.tsx`)
- Customer receives clean web link: `https://flyora.com/quote/abc123-token`.
- Displays branded quote overview, day-by-day inclusions, price breakdown, and validity date.
- Clean CTA: "Accept Quote via WhatsApp" or "Call Coordinator".
- Eliminates messy PDF generation, screenshots, or emailing manual Word files.

### Key API Endpoints
- `POST /api/v1/leads/:id/quotations` — Create new quotation with manual item lines and margin calculation.
- `GET /api/v1/quotations/:id` — Get quotation details (internal view with costs & margins visible to staff).
- `GET /api/v1/public/quotes/:shareToken` — Public view of the quotation by secure token (costs and margins hidden, only selling price shown to customer).
- `PATCH /api/v1/quotations/:id/accept` — Coordinator marks quote accepted after customer confirms by call or WhatsApp.

---

## Module 6: Booking & Manual Payment Tracking

### Objectives
Convert accepted quotes into confirmed bookings and manage offline payments (NEFT/IMPS/UPI) with receipt proof verification stored on Cloudflare R2.

### Core Data Models
```prisma
enum BookingStatus {
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  BANK_TRANSFER_NEFT_IMPS
  UPI
  CREDIT_DEBIT_OFFLINE
  CASH
}

enum PaymentVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

model Booking {
  id          String        @id @default(uuid())
  bookingRef  String        @unique // e.g. "BK-2026-0891"
  leadId      String        @unique
  quotationId String        @unique
  status      BookingStatus @default(CONFIRMED)
  totalAmount Decimal       @db.Decimal(10, 2)
  paidAmount  Decimal       @default(0) @db.Decimal(10, 2)
  dueAmount   Decimal       @db.Decimal(10, 2)
  travelDate  DateTime
  createdAt   DateTime      @default(now())

  lead        Lead          @relation(fields: [leadId], references: [id])
  quotation   Quotation     @relation(fields: [quotationId], references: [id])
  payments    Payment[]
}

model Payment {
  id                 String                    @id @default(uuid())
  bookingId          String
  recordedById       String
  amount             Decimal                   @db.Decimal(10, 2)
  method             PaymentMethod
  transactionRef     String                    // Bank UTR or UPI Transaction ID
  receiptFileKey     String                    // Cloudflare R2 private file key
  status             PaymentVerificationStatus @default(PENDING)
  notes              String?
  paymentDate        DateTime                  @default(now())
  createdAt          DateTime                  @default(now())

  booking            Booking                   @relation(fields: [bookingId], references: [id])
  recordedBy         User                      @relation(fields: [recordedById], references: [id])
}
```

### Key API Endpoints
- `POST /api/v1/quotations/:id/convert-to-booking` — Creates Booking record from accepted quote.
- `POST /api/v1/bookings/:id/payments` — Records payment entry with transaction UTR and R2 receipt proof.
- `PATCH /api/v1/payments/:id/verify` — (Admin / Accounts only) Verify payment entry.
- `GET /api/v1/payments/:id/receipt-url` — Generates a 15-minute presigned R2 URL to view the receipt proof.

---

## Module 7: Cloudflare R2 Storage Service

### Objectives
Provide fast direct uploads and secure file management using Cloudflare R2's S3-compatible API.

### Operations
1. **Public Uploads (Package images & banners):**
   - API generates presigned PUT URL for bucket `flyora-public`.
   - Admin frontend uploads directly to R2.
   - Served via public CDN domain: `https://media.flyora.com/packages/dubai.jpg`.
2. **Private Uploads (Payment receipts & Customer documents):**
   - Presigned PUT URL generated for bucket `flyora-private`.
   - Viewing requires authenticated request to `/api/v1/storage/presigned-download`, returning a temporary signed URL valid for 15 minutes.

---

## Module 8: Public Next.js Website & SEO Architecture

### Objectives
Create a fast, responsive travel portal that ranks high on Google and converts visitors directly into service leads.

### Key Features
1. **Dynamic Pages with Next.js ISR (Incremental Static Regeneration):**
   - `/tours/[slug]` — Tour packages with rich photo gallery, day-wise itinerary, inclusions, and booking form.
   - `/services/[slug]` — Dedicated landing pages for *Visa Assistance, Flight Bookings, Umrah Services, Custom Holidays*.
   - `/destinations/[slug]` — Destination guide hubs linking to corresponding tour packages.
2. **SEO Optimization:**
   - Pre-rendered HTML for search bots.
   - Dynamic `generateMetadata()` injecting title, description, and OpenGraph image preview.
   - JSON-LD Structured Data: `TouristTrip`, `Offer`, `BreadcrumbList`, and `TravelAgency`.
3. **Smart Click-to-WhatsApp CTA:**
   - Button on every package page that opens WhatsApp with pre-filled context:
   `"Hello Flyora, I am interested in the [Dubai Luxury 5D/4N Package] (Ref: DUB-5D). Please provide details."`
   - Automatically passes package reference so the coordinator knows the exact service requested.
