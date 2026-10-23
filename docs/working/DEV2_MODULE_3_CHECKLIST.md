# Flyora Travels — Developer 2 Module 3 Master Plan & Checklist

## "Take Lead" Service Pool, Coordinator Pipeline & Action Workspace

**Owner:** Developer 2 (Coordinator Admin UI & Daily Sales Workspace)  
**Target Workspace:** `apps/admin` (Directory: `apps/admin/src/pages/leads/`)  
**Git Branch:** `sahil` (tracking `origin/develop`)  
**Design Standard:** Strict Off-White Minimalist (`#F8F8F6` canvas, `#FFFFFF` cards, `#000000` solid black CTAs, `#E4E4E7` borders, `#71717A` ash text, `font-mono` metrics)  
**Status:** Completed & Verified — 0 Errors

---

## 1. Executive Summary & Scope Boundaries

### Dev 2 Responsibilities

Developer 2 owns the **entire Coordinator Daily Experience**:

1. **Service Lead Pool (`/leads?tab=pool`):** Real-time list of unassigned customer enquiries matching the coordinator's service specializations (e.g., Dubai Holidays, Umrah, Visa).
2. **Instant "Take Lead" Action:** First-come, first-served claim button with optimistic UI and graceful **409 Conflict handling** (when another coordinator claims the lead first).
3. **"My Leads" Active Pipeline (`/leads?tab=my-leads`):** Personal workspace for claimed leads filtered by stage (`NEW`, `CONTACTED`, `QUOTED`, `NEGOTIATING`, `BOOKED`, `LOST`).
4. **Lead Action Slide-Over Drawer:**
   - **Click-to-Call:** `<a href="tel:+91...">`
   - **Click-to-WhatsApp:** `<a href="https://wa.me/91...?text=...">` with pre-filled customer and service details.
   - **Quick Stage Switcher:** Immediate dropdown update.
   - **Internal Notes & Follow-Up Reminder:** Timestamped note logger + `followUpDate` scheduler.
   - **Activity History Timeline:** Audit log of claims, status changes, and notes.

### 🛑 Strict Code Boundaries (Zero Merge Conflicts)

| What Dev 2 OWNS                                                       | What Dev 2 MUST NEVER TOUCH                                                      |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| ✅ `apps/admin/src/pages/leads/**`                                    | ❌ `apps/admin/src/pages/admin/**` (Owned by Dev 3: Master Leads `/admin/leads`) |
| ✅ `apps/admin/src/lib/leadsApi.ts`                                   | ❌ `apps/web/**` (Owned by Dev 3: Public Website & Enquiry Form)                 |
| ✅ `apps/admin/src/components/layout/Sidebar.tsx` (Activate `/leads`) | ❌ `apps/api/**` (Owned by Dev 1: Fastify Backend & DB Migrations)               |
| ✅ Route `/leads` in `apps/admin/src/App.tsx`                         | ❌ Do NOT invent custom local interfaces (Use `@flyora/types`)                   |

---

## 2. Dependency Analysis: Are You Blocked?

### 🚀 VERDICT: You are 100% UNBLOCKED!

You do **NOT** need to wait for Dev 1 (Backend) or Dev 3 (Web/Admin):

| Potential Dependency          | Current Status           | Why You Are NOT Blocked                                                                                                                                                                                                                 |
| :---------------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma Schema & DB Models** | ✅ **Already in repo**   | `Lead`, `Customer`, `LeadActivity`, `LeadStatus`, `LeadSource` are already defined in `packages/database/prisma/schema.prisma`.                                                                                                         |
| **Shared TypeScript Types**   | ✅ **Already in repo**   | `LeadItem`, `LeadStatus`, `LeadSource`, `CustomerSummary`, `LeadActivityItem` already exist in `packages/types/src/lead.ts`.                                                                                                            |
| **Backend API Endpoints**     | ⏳ **Dev 1 is building** | **Mock-First Protocol:** We implement `apps/admin/src/lib/leadsApi.ts` with typed fallback mock data (`mockLeadsData.ts`). You build, style, and test the entire UI now; when Dev 1 deploys, simply flip the mock fallback to live API! |
| **Public Web Enquiry Form**   | ⏳ **Dev 3 is building** | Dev 3 operates independently in `apps/web`. Your UI renders leads from database/mock regardless of how they were submitted.                                                                                                             |
| **Master Admin Leads Table**  | ⏳ **Dev 3 is building** | Dev 3 works exclusively in `/admin/leads`. You work exclusively in `/leads`. No shared files.                                                                                                                                           |

---

## 3. Data Contracts (Already Available in `@flyora/types`)

```ts
// From packages/types/src/lead.ts
export type LeadStatus =
  "NEW" | "CONTACTED" | "QUOTED" | "NEGOTIATING" | "BOOKED" | "LOST";
export type LeadSource =
  "WEBSITE_FORM" | "WHATSAPP_CLICK" | "PHONE_CALL" | "DIRECT_WALK_IN";

export interface CustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
}

export interface LeadItem {
  id: string;
  customerId: string;
  customer: CustomerSummary;
  serviceId: string;
  serviceName: string;
  packageId?: string | null;
  packageTitle?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  claimedAt?: string | null;
  status: LeadStatus;
  source: LeadSource;
  travelDate?: string | null;
  numberOfAdults: number;
  numberOfKids: number;
  estimatedBudget?: number | null;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivityItem {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}
```

---

## 4. Step-by-Step Implementation Checklist for Dev 2

### Phase 1: API Client & Mock Data Layer (`apps/admin/src/lib/`)

- [x] **1.1. Create Mock Data Fixtures (`apps/admin/src/pages/leads/mockLeadsData.ts`)**
  - [x] 5+ realistic unassigned pool leads across Dubai, Kashmir, Visa, Umrah.
  - [x] 8+ realistic claimed leads in various stages (`NEW`, `CONTACTED`, `QUOTED`, `NEGOTIATING`, `BOOKED`, `LOST`).
  - [x] Realistic `LeadActivityItem` timeline logs for each lead.
- [x] **1.2. Create Leads API Client (`apps/admin/src/lib/leadsApi.ts`)**
  - [x] `fetchPoolLeads(serviceId?: string)` -> calls `GET /leads/pool` (with mock fallback).
  - [x] `fetchMyLeads(params?: { status?: string; search?: string })` -> calls `GET /leads/my-leads` (with mock fallback).
  - [x] `takeLead(leadId: string)` -> calls `POST /leads/:id/take` (returns `{ success: true, lead: LeadItem }`).
  - [x] `updateLeadStatus(leadId: string, status: LeadStatus)` -> calls `PATCH /leads/:id/status`.
  - [x] `addLeadNote(leadId: string, note: string, followUpDate?: string)` -> calls `POST /leads/:id/notes`.
  - [x] `fetchLeadActivities(leadId: string)` -> calls `GET /leads/:id/activities`.

### Phase 2: Navigation, Routing & Role Access

- [x] **2.1. Update Sidebar Navigation (`apps/admin/src/components/layout/Sidebar.tsx`)**
  - [x] Activate "Service Pool" pointing to `/leads?tab=pool`.
  - [x] Activate "My Leads" pointing to `/leads?tab=my-leads`.
  - [x] Add live unassigned pool count badge (e.g., `Live`) next to Service Pool.
- [x] **2.2. Register `/leads` Route in `apps/admin/src/App.tsx`**
  - [x] Protected route accessible to `SERVICE_COORDINATOR`, `OPERATIONS_MANAGER`, `SUPER_ADMIN`.
  - [x] Lazy/direct import of `CoordinatorLeadsPage`.

### Phase 3: Service Pool View ("Available to Claim")

- [x] **3.1. Pool Metric Cards**
  - [x] Unassigned pool count for coordinator's service.
  - [x] New today count.
  - [x] Average response speed indicator.
- [x] **3.2. Pool Leads Table & Cards**
  - [x] Customer Name & masked contact (`+91 98765 •••••`).
  - [x] Service tag with distinct minimal styling (e.g., `Dubai Holiday`, `Umrah`).
  - [x] Travel details: Destination, Travel Date, Adults/Kids count, Budget.
  - [x] Relative timestamp ("5m ago", "1h ago").
  - [x] Source badge (`Web Form`, `WhatsApp`).
- [x] **3.3. Atomic "Take Lead" Action & Conflict Handling**
  - [x] Prominent black CTA button: **"Take Lead"** with instant lightning/lock icon.
  - [x] Optimistic removal from pool table immediately upon click.
  - [x] On Success: Toast notification _"Lead claimed! Moved to My Leads"_, switch active tab or badge update.
  - [x] On `409 Conflict` (Another coordinator took it): Toast error alert _"Another coordinator just claimed this lead"_, re-fetch pool automatically.

### Phase 4: My Active Leads Pipeline View ("My Leads")

- [x] **4.1. Stage Filter Tabs**
  - [x] Tab buttons: `All`, `New`, `Contacted`, `Quoted`, `Negotiating`, `Booked`, `Lost` with pill counts.
- [x] **4.2. Search & Filter Bar**
  - [x] Search input by Customer Name, Phone, or Package title.
  - [x] Quick filter: "Follow-up Today" toggle switch / button.
- [x] **4.3. My Leads Table / Card Layout**
  - [x] Customer Name & Phone number.
  - [x] Current Status Badge with distinct color dot (`Emerald`, `Amber`, `Blue`, `Purple`, `Zinc`).
  - [x] Scheduled `Follow-up Date` with overdue/today warning highlights (`text-amber-600` / `text-rose-600`).
  - [x] Last activity timestamp and author.
  - [x] "Open Lead" button triggering the Slide-Over Drawer.

### Phase 5: Lead Detail Action Drawer (`LeadDetailDrawer.tsx`)

- [x] **5.1. Slide-Over Drawer Architecture**
  - [x] Smooth slide-in from right side with backdrop overlay.
  - [x] Close on `Esc` key or backdrop click.
- [x] **5.2. Customer Header & One-Click Contact Actions**
  - [x] Customer Full Name, City, Creation timestamp.
  - [x] **Click-to-Call Button:** Direct `<a href="tel:...">` with phone icon.
  - [x] **Click-to-WhatsApp Button:** Direct `<a href="https://wa.me/..." target="_blank">` with pre-filled context:
    - `"Hello [Name], this is [Coordinator] from Flyora Travels regarding your [Service/Package] enquiry..."`
- [x] **5.3. Quick Status Stage Dropdown**
  - [x] Instant update selector to advance lead stage.
  - [x] Immediate UI update + optimistic API mutation.
- [x] **5.4. Notes & Follow-Up Date Scheduler**
  - [x] Textarea for internal remarks (e.g. "Customer requested 4-star hotel in Deira, budget ₹1.2L").
  - [x] Date picker for `followUpDate`.
  - [x] "Save Note" action that posts note and refreshes activity feed.
- [x] **5.5. Activity Timeline Feed**
  - [x] Chronological vertical feed of all activity logs:
    - `CLAIMED_LEAD` (when coordinator claimed from pool)
    - `STATUS_CHANGE` (e.g. "Changed status from NEW to CONTACTED")
    - `NOTE_ADDED` (internal notes with timestamp and coordinator name)
    - `CALL_LOGGED` / `WHATSAPP_CLICKED`

### Phase 6: TanStack Query Wiring & Polish

- [x] `useQuery` for pool leads with auto-refetch interval (e.g. every 15s for fresh incoming pool alerts).
- [x] `useQuery` for coordinator's my-leads.
- [x] `useMutation` with optimistic cache updates for `takeLead`, `updateStatus`, and `addNote`.
- [x] Loading skeletons for pool and leads table.
- [x] Empty state illustrations (e.g. "No unassigned leads in your service pool — All caught up!").

### Phase 7: Verification & Exit Gate

- [x] `npm run lint` passes without errors.
- [x] `npm run build` succeeds with 0 TypeScript errors.
- [x] Code and architecture review completed against all Module 3 specifications.

---

## 5. UI Theme & Style Guide (Flyora Off-White Minimalist)

- **Canvas Background:** `#F8F8F6`
- **Card Background:** `#FFFFFF` with `border border-zinc-200/90`
- **Primary Action (CTA):** `#000000` solid black with `text-white hover:bg-zinc-800`
- **Secondary Action:** `#FFFFFF` with `border border-zinc-200 hover:bg-zinc-50`
- **Muted Labels:** `text-xs text-zinc-500 font-mono`
- **Status Dots:**
  - `NEW`: `bg-blue-500`
  - `CONTACTED`: `bg-amber-500`
  - `QUOTED`: `bg-purple-500`
  - `NEGOTIATING`: `bg-indigo-500`
  - `BOOKED`: `bg-emerald-500`
  - `LOST`: `bg-zinc-400`
- **Icons:** `lucide-react` (`Phone`, `MessageSquare`, `Clock`, `Calendar`, `Lock`, `Sparkles`, `CheckCircle2`, `AlertCircle`)
