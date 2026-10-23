# Module 3 & 4: Simple "Take Lead" Pool & Coordinator Workspace — 3-Developer Work Split

**Goal:** Implement the instant "Take Lead" (first-come, first-served) service pool, atomic claim locking (prevent race conditions), coordinator daily workflow (Click-to-Call, Click-to-WhatsApp, notes, status stages), and full Admin master oversight.

---

## 1. Why Skipping Cloudflare R2 Credentials Right Now is 100% Safe

- **Zero R2 Dependency in Module 3:** Module 3 is purely transactional and relational (PostgreSQL + Prisma + Fastify + React). Leads, customers, atomic locks, notes, and coordinator assignments do NOT upload or process binary files.
- **Module 2 R2 Code is Already Ready:** The S3 SDK integration (`apps/api/src/modules/storage`) is already fully coded. As soon as client credentials arrive, you simply paste them into `apps/api/.env` with zero code modifications needed.
- **No Blockers:** The entire team can push ahead with Module 3 with 0 friction.

---

## 2. 🚨 CRITICAL AI & DEVELOPER GUARDRAILS (READ BEFORE WRITING ANY CODE)

> ### 🛑 RULE 1: STRICT CODE BOUNDARIES (PREVENT MERGE CONFLICTS)
>
> - **Dev 1 (Backend):** ONLY touch `apps/api`, `packages/types`, and `packages/validators`. **NEVER touch `apps/admin` or `apps/web`!**
> - **Dev 2 (Coordinator Admin UI):** ONLY touch `apps/admin/src/pages/leads/` (Coordinator Workspace, `/leads`). **NEVER touch `apps/admin/src/pages/admin/` or `apps/web`!**
> - **Dev 3 (Admin Master & Public Web):** ONLY touch `apps/admin/src/pages/admin/` (Master Lead Control Center, `/admin/leads`) and `apps/web`. **NEVER touch Dev 2's Coordinator files!**

---

> ### 🛑 RULE 2: STOP BLIND CODING & TYPE INVENTIONS
>
> - **Do NOT invent duplicate local interfaces** in `apps/admin` or `apps/web`. All TypeScript types MUST come from `@flyora/types`.
> - **Do NOT hardcode conflicting API payload shapes.** All request validations MUST strictly follow `@flyora/validators`.

---

> ### 🛑 RULE 3: WAITING & PARALLEL MOCKING PROTOCOL
>
> - If an API endpoint is not yet ready, **DO NOT wait idly, and DO NOT guess backend implementation.**
> - Use the **Mock First** protocol: Create a typed mock response in TanStack Query (`initialData: mockLeads`) so the UI can be built and styled 100% in parallel without blocking.

---

## 3. Dependency & Waiting Matrix (Who Waits for Whom?)

| Task                                          | Owner           | Waiting Developer | Status / Safe Parallel Action                                                                                                          |
| :-------------------------------------------- | :-------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **Shared Types & Zod Schemas**                | **Dev 1**       | **Dev 2 & Dev 3** | ⏳ **Dev 2 & 3 must wait ~15 mins** for Dev 1 to push Step 1, OR Dev 2/3 can use existing types in `packages/types/src/lead.ts`.       |
| **Atomic Claim API (`POST /leads/:id/take`)** | **Dev 1**       | **Dev 2**         | 🛑 **Dev 2 must NOT wire real API** until Dev 1 deploys. **Action:** Dev 2 builds UI with mock state toggle first.                     |
| **Public Enquiry Form (`apps/web`)**          | **Dev 3**       | **NOBODY**        | ✅ **100% UNBLOCKED!** `publicEnquirySchema` already exists in `packages/validators`. Dev 3 can write the entire web form right now!   |
| **Admin Master Reassign API**                 | **Dev 1**       | **Dev 3**         | 🛑 **Dev 3 must NOT wire real reassign API** until Dev 1 finishes Step 4. **Action:** Dev 3 builds Master Table UI with mock handlers. |
| **Integration & End-to-End Test**             | **Dev 1, 2, 3** | **All 3 Devs**    | ⏳ **Joint PR Gate.** All 3 test live: Form submits -> Pool displays -> Coordinator claims -> Admin observes.                          |

---

## 4. 3-Developer Work Allocation Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 0: Base Contracts (Dev 1 publishes FIRST — 15 mins)               │
│ Shared Types (@flyora/types) + Zod Schemas (@flyora/validators)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ DEV 1 (Backend)  │       │ DEV 2 (Frontend) │       │ DEV 3 (Frontend) │
│ Branch:          │       │ Branch:          │       │ Branch:          │
│ feat/m3-leads-   │       │ feat/m3-coord-   │       │ feat/m3-capture- │
│ take-pool-api    │       │ workspace-ui     │       │ admin-leads      │
│                  │       │                  │       │                  │
│ [ALERT FOR AI]:  │       │ [ALERT FOR AI]:  │       │ [ALERT FOR AI]:  │
│ Publish types    │       │ Mock API until   │       │ Web form is 100% │
│ FIRST! No UI     │       │ Dev 1 finishes!  │       │ ready to code!   │
│ code in API PR.  │       │ Stay in /leads.  │       │ Stay in web &    │
│                  │       │                  │       │ /admin/leads.    │
│ • Public Enquiry │       │ • Service Lead   │       │ • Admin Master   │
│   API endpoint   │       │   Pool UI        │       │   Lead Center    │
│ • Atomic "Take   │       │ • "Take Lead"    │       │ • Manual Admin   │
│   Lead" Lock     │       │   Button + 409   │       │   Reassign Modal │
│   (409 Conflict) │       │   Conflict UI    │       │ • Public Enquiry │
│ • Service Pool & │       │ • "My Leads" Tab │       │   Modal / Form   │
│   My Leads APIs  │       │ • Lead Detail    │       │   in apps/web    │
│ • Status & Notes │       │   Drawer (Call / │       │ • Direct Click-  │
│   Activity APIs  │       │   WhatsApp links)│       │   to-WhatsApp    │
│ • Alert Logger   │       │ • Follow-up &    │       │   Widget         │
│   (Stub for SMS) │       │   Notes timeline │       │                  │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ INTEGRATION & PR GATE                                                  │
│ 1. Dev 3 submits enquiry via Web form -> arrives in unassigned Pool    │
│ 2. Dev 2 logs in as Coordinator -> Clicks "Take Lead" -> Atomic lock   │
│ 3. Dev 2 updates stage to "Contacted", adds note -> Dev 3 (Admin) sees │
│    live update & can reassign if needed                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Developer 1 Checklist (Backend & Shared Contracts)

### Branch Name: `feat/m3-leads-take-pool-api`

> ⚠️ **AI Prompt Instruction for Dev 1:**  
> _"You are Dev 1. Complete Step 1 (Contracts) FIRST and commit. DO NOT touch `apps/admin` or `apps/web`. Ensure atomic update locking on `/leads/:id/take` to prevent race conditions."_

#### Step 1: Shared Contracts (Priority 1 — Unlocks Dev 2 & 3)

- [x] In `packages/types/src/lead.ts`:
  - Ensure exports for `LeadItem`, `LeadStatus`, `LeadSource`, `LeadActivityItem`.
  - Add `TakeLeadResponse`, `UpdateLeadStatusInput`, `AddLeadNoteInput`, `ReassignLeadInput`.
- [x] In `packages/validators/src/leadSchema.ts`:
  - `claimLeadSchema`: `{ leadId: string }`
  - `updateLeadStatusSchema`: `{ status: z.enum([...LeadStatus]) }`
  - `addLeadNoteSchema`: `{ note: z.string().min(1), followUpDate: z.string().optional() }`
  - `reassignLeadSchema`: `{ assignedToId: z.string().uuid() }`
- [x] Export from root `packages/types/src/index.ts` and `packages/validators/src/index.ts`.
- [x] **COMMIT & PUSH IMMEDIATELY** with message: `feat(contracts): add lead schemas and types for module 3`.

#### Step 2: Public Enquiry Intake (`apps/api/src/modules/enquiries` or `leads`)

- [x] `POST /api/v1/public/enquiry`:
  - Validates request against `publicEnquirySchema`.
  - Upserts `Customer` record by phone number.
  - Creates new `Lead` with `assignedToId = null` (unassigned) and `status = 'NEW'`.
  - Logs notification alert stub to console for service coordinators.

#### Step 3: Atomic "Take Lead" Concurrency Controller (`apps/api/src/modules/leads`)

- [x] `POST /api/v1/leads/:id/take`:
  - Guard: `requireRole(['SERVICE_COORDINATOR', 'OPERATIONS_MANAGER', 'SUPER_ADMIN'])`.
  - Atomic query execution (prevent race conditions):
    ```ts
    const updated = await prisma.lead.updateMany({
      where: {
        id: leadId,
        assignedToId: null, // Only lock if currently unassigned!
      },
      data: {
        assignedToId: req.user.id,
        claimedAt: new Date(),
        status: "CONTACTED",
      },
    });

    if (updated.count === 0) {
      return reply.status(409).send({
        error: "Conflict",
        message: "This lead has already been claimed by another coordinator.",
      });
    }
    ```
  - Creates `LeadActivity`: `action = "CLAIMED_LEAD"`.

#### Step 4: Coordinator Queues & Daily Management APIs

- [x] `GET /api/v1/leads/pool`: Returns unassigned leads matching coordinator's `UserService` mappings.
- [x] `GET /api/v1/leads/my-leads`: Returns leads assigned to `req.user.id` (supports status filters).
- [x] `GET /api/v1/leads/all`: (Super Admin & Ops Manager) Returns all leads across services.
- [x] `PATCH /api/v1/leads/:id/status`: Updates stage and logs activity.
- [x] `POST /api/v1/leads/:id/notes`: Appends note into `LeadActivity` and updates `followUpDate`.
- [x] `PATCH /api/v1/leads/:id/reassign`: (Admin only) Transfers lead to another coordinator.

---

## 6. Developer 2 Checklist (Frontend: Coordinator Workspace & "Take Lead" Pool)

### Branch Name: `feat/m3-coordinator-workspace-ui`

**Target Workspace:** `apps/admin` (Path: `apps/admin/src/pages/leads/`)

> ⚠️ **AI Prompt Instruction for Dev 2:**  
> _"You are Dev 2. Work ONLY inside `apps/admin/src/pages/leads/`. DO NOT touch `MasterLeadsPage` or `/admin/leads` (Dev 3 owns that). If Dev 1 API is not yet running, use typed mock state so your UI is 100% complete without blocking."_

#### Step 1: Navigation & Routing

- [ ] Add **"Leads Workspace"** navigation item in `AdminLayout` (role: Coordinator, Manager, Admin).
- [ ] Display counter badge for unassigned leads in coordinator's pool.
- [ ] Add route `/leads` in `apps/admin/src/App.tsx`.

#### Step 2: Service Lead Pool View (Tab 1: "Available to Claim")

- [ ] Shows cards/table of unassigned leads matching coordinator's service:
  - Customer Name, Service Tag (e.g., _Dubai Holiday_, _Visa Assistance_), Travel Date, Pax Count, Time Ago.
- [ ] **"Take Lead" Action Button:**
  - Optimistic UI: Immediately removes lead from the pool table on click.
  - Calls `POST /api/v1/leads/:id/take`.
  - On `409 Conflict`: Toast error _"Another coordinator just claimed this lead"_ and refetches pool.
  - On Success: Toast success _"Lead claimed! Moved to My Leads"_.

#### Step 3: My Active Leads View (Tab 2: "My Leads")

- [ ] Filter tabs: `All`, `New`, `Contacted`, `Quoted`, `Negotiating`, `Booked`, `Lost`.
- [ ] Search input by customer name, phone, or destination.
- [ ] Follow-up reminder indicator (e.g. "Follow-up Today" badge).

#### Step 4: Lead Detail Drawer / Slide-Over Modal

- [ ] **Direct Contact Actions:**
  - Click-to-Call button: `<a href="tel:+91...">`
  - Click-to-WhatsApp button: `<a href="https://wa.me/91...?text=Hello..." target="_blank">`
- [ ] **Status Selector Dropdown:**
  - Quick update from `NEW` -> `CONTACTED` -> `QUOTED`, etc.
- [ ] **Quick Notes & Follow-up:**
  - Textarea to add internal note.
  - Date picker for `followUpDate`.
  - Button "Add Note" appending to activity log.
- [ ] **Activity Timeline Feed:**
  - Vertical list showing who claimed, status changes, and timestamped notes.

---

## 7. Developer 3 Checklist (Admin Master Oversight & Public Lead Capture)

### Branch Name: `feat/m3-capture-and-admin-leads`

**Target Workspaces:** `apps/web` (Public Form) & `apps/admin` (Master Leads: `apps/admin/src/pages/admin/`)

> ⚠️ **AI Prompt Instruction for Dev 3:**  
> _"You are Dev 3. You can start `apps/web` IMMEDIATELY with zero waiting because `publicEnquirySchema` already exists! In `apps/admin`, work ONLY in `MasterLeadsPage.tsx` at `/admin/leads`. Do NOT touch Dev 2's Coordinator Workspace files."_

#### Step 1: Public Enquiry Capture Modal & Form (`apps/web`) — **START IMMEDIATELY!**

- [x] Responsive Enquiry Modal / Section on website:
  - Fields: Full Name, 10-digit Phone, Service Dropdown (Holidays, Visa, Flights, Umrah), Travel Date, Adults, Kids, Notes.
  - Validated with `publicEnquirySchema` from `@flyora/validators`.
- [x] Submit handler calling `POST /api/v1/public/enquiry`:
  - Loading spinner & disabled submit button.
  - Success message dialog: _"Thank you! Our travel specialist will contact you shortly."_
  - Fallback direct WhatsApp chat button.
- [x] Floating Click-to-WhatsApp button on bottom-right of `apps/web`.

#### Step 2: Admin Master Lead Control Center (`apps/admin` -> `/admin/leads`)

- [x] Master table view accessible strictly by `SUPER_ADMIN` and `OPERATIONS_MANAGER` at `/admin/leads`:
  - Columns: Customer Name, Phone, Service, Assigned Coordinator (or "Unassigned" badge), Status, Date.
  - Filters: By Service, By Assigned Coordinator, By Status, By Date range.
- [x] **Manual Reassign Modal:**
  - If a coordinator is on leave or unresponsive, Admin clicks "Reassign".
  - Dropdown of active coordinators for that service.
  - Calls `PATCH /api/v1/leads/:id/reassign`.
  - Appends activity log: _"Reassigned by Admin to [Name]"_.

---

## 8. PR & Merge Gate (Exit Criteria for Module 3)

- [ ] **PR 3.1 (Dev 1):** Backend leads pool, atomic claim locking, status/notes APIs merged.
- [ ] **PR 3.2 (Dev 2):** Coordinator workspace, claim button with conflict handling, and lead drawer merged.
- [ ] **PR 3.3 (Dev 3):** Admin master leads table + reassignment and public enquiry web form merged.
- [ ] **End-to-End Joint Test:**
  1. Dev 3 submits enquiry on `apps/web` (e.g. "Ahmed - Dubai Holiday 4 Pax").
  2. Enquiry appears in Dev 2's "Service Pool" in `apps/admin`.
  3. Dev 2 clicks "Take Lead" -> Lead locks to Dev 2, vanishes from unassigned pool, moves to "My Leads".
  4. Dev 2 changes status to `CONTACTED` and adds note: "Called customer, wants 5-star hotel".
  5. Dev 3 logs into Admin portal -> Sees Ahmed's lead claimed by Dev 2 with updated status and notes.
- [ ] `npm run build` passes with 0 errors across all 3 apps and packages.
