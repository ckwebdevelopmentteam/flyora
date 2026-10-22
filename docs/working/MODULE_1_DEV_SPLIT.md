# Module 1: Auth, Roles & Service-Coordinator RBAC — 2-Developer Work Split

**Goal:** Deliver a rock-solid authentication system, role permissions, and service-coordinator mapping so that:
- Admins can create staff and assign their specific services (e.g. Visa, Holidays, Flights) and phone numbers.
- Staff can log in and have their role and service permissions loaded automatically.

---

## 1. Work Allocation Matrix

```
┌────────────────────────────────────────────────────────┐
│ STEP 0: Base Contract (Dev 1 creates, Dev 2 approves)  │
│ Prisma Schema + Shared Types + Zod Schemas             │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ DEV 1: Backend (Fastify)│ │ DEV 2: Frontend (Admin) │
│ [PARALLEL WORK]         │ │ [PARALLEL WORK]         │
│ • Fastify JWT & CORS    │ │ • Vite React scaffold   │
│ • Auth endpoints        │ │ • Zustand auth store    │
│ • Staff & Services CRUD │ │ • Login Screen UI       │
│ • Auth middleware guards│ │ • Protected Layout/Nav  │
│                         │ │ • Team & Services UI    │
└────────────┬────────────┘ └────────────┬────────────┘
             │                           │
             └─────────────┬─────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ INTEGRATION & PR GATE                                  │
│ Dev 2 connects Admin UI to Dev 1 Fastify API endpoints  │
│ Both test: Admin login, Coordinator login, RBAC badges │
└────────────────────────────────────────────────────────┘
```

---

## 2. Developer 1 Checklist (Backend & Shared Contracts)

### Branch Name: `feat/m1-api-auth-rbac`

#### Step 1: Base Contracts (Shared with Dev 2 first)
- [ ] Write `packages/database/prisma/schema.prisma` for Module 1:
  - [ ] `User`, `UserRole` (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR`, `ACCOUNTS`, `CONTENT_MANAGER`)
  - [ ] `StaffAvailability` (`AVAILABLE`, `BUSY`, `OFF_DUTY`)
  - [ ] `Service` (name, slug, minMarginPercent)
  - [ ] `UserService` (mapping user to services with `isPrimary`)
- [ ] Run Prisma migration: `npx prisma migrate dev --name init_auth_services`.
- [ ] Define shared TypeScript interfaces in `packages/types/src/auth.ts` and `service.ts`.
- [ ] Define shared Zod schemas in `packages/validators/src/authSchema.ts` (loginSchema, createUserSchema).
- [ ] **PR / Push Milestone 1.0:** Merge or push so Dev 2 can pull exact types.

#### Step 2: Fastify App & Auth Infrastructure
- [ ] Scaffold `apps/api` with Fastify + TypeScript.
- [ ] Register `@fastify/jwt` and `@fastify/cors`.
- [ ] Implement password hashing using `bcryptjs` or `argon2`.
- [ ] Create database seed script with:
  - [ ] 1 Default Super Admin account.
  - [ ] Initial Services seed (*"Holiday Packages"*, *"Visa Assistance"*, *"Flight Booking"*, *"Umrah & Hajj"*, *"Hotel Booking"*).

#### Step 3: Auth Endpoints (`apps/api/src/modules/auth`)
- [ ] `POST /api/v1/auth/login` — Validate email/password, issue JWT access + refresh tokens.
- [ ] `GET /api/v1/auth/me` — Return current logged-in user details, role, and assigned services.
- [ ] `POST /api/v1/auth/refresh` — Refresh expired access token using refresh token.
- [ ] `POST /api/v1/auth/logout` — Invalidate session.

#### Step 4: Staff & Service-Coordinator Endpoints (`apps/api/src/modules/users`)
- [ ] `GET /api/v1/users` — List staff with their roles, availability, and assigned services (Admin only).
- [ ] `POST /api/v1/users` — Create/invite staff member with role, phone number, and service mappings.
- [ ] `PATCH /api/v1/users/:id/services` — Update coordinator's assigned services.
- [ ] `PATCH /api/v1/users/:id/availability` — Toggle `AVAILABLE` | `BUSY` | `OFF_DUTY`.

#### Step 5: Middleware & Guards (`apps/api/src/middleware`)
- [ ] `authenticate` middleware (verifies JWT token from Authorization header).
- [ ] `requireRole(roles[])` guard (blocks non-admins from user management).

---

## 3. Developer 2 Checklist (Frontend Admin Portal & UI)

### Branch Name: `feat/m1-admin-auth-ui`

#### Step 1: Admin App Scaffolding
- [ ] Scaffold `apps/admin` (Vite + React 19 + TypeScript + Tailwind CSS).
- [ ] Set up React Router with routes:
  - [ ] `/login` (Public)
  - [ ] `/` (Dashboard root - Protected)
  - [ ] `/team` (Staff & Coordinators - Admin only)

#### Step 2: State & API Client
- [ ] Install & configure `@tanstack/react-query`.
- [ ] Configure `zustand` store (`src/stores/authStore.ts`):
  - [ ] Stores: `user`, `accessToken`, `isAuthenticated`.
  - [ ] Actions: `setAuth()`, `clearAuth()`, `setAvailability()`.
- [ ] Setup Axios / Fetch API client (`src/lib/apiClient.ts`):
  - [ ] Request interceptor: attaches `Authorization: Bearer <token>`.
  - [ ] Response interceptor: handles 401s by triggering token refresh or redirecting to `/login`.

#### Step 3: Login Screen UI
- [ ] Build clean, responsive login page:
  - [ ] Email and Password inputs using React Hook Form + shared Zod schema.
  - [ ] Error message alerts (e.g. "Invalid credentials").
  - [ ] Loading spinner on submit.

#### Step 4: Protected Layout & Shell
- [ ] Build Admin Layout (`src/components/layout/AdminLayout.tsx`):
  - [ ] **Sidebar:** Dynamic navigation based on role:
    - Admin/Manager sees: *Dashboard, All Leads, Quotes, Bookings, Payments, Team Settings*.
    - Coordinator sees: *My Leads, Service Pool, Quotes*.
  - [ ] **Header:**
    - Staff name & Role badge (e.g., `Holiday Packages Coordinator`).
    - Availability Dropdown toggle: 🟢 `Available` | 🟡 `Busy` | ⚪ `Off-Duty`.
    - Logout button.

#### Step 5: Team Management Screen (Admin Only) (`/team`)
- [ ] Staff List Table (Name, Email, Phone, Role badge, Assigned Services badges, Availability status).
- [ ] "Add Staff Member" Modal:
  - [ ] Name, Email, Phone Number, Password.
  - [ ] Role selector dropdown (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR`, `ACCOUNTS`, `CONTENT_MANAGER`).
  - [ ] Multi-select service checklist (e.g. ☑️ *Visa Assistance*, ☑️ *Holiday Packages*) with Primary toggle.

---

## 4. Parallel Work vs. Waiting Dependencies

| Task Item | Dev 1 (Backend) | Dev 2 (Frontend) | Can Work in Parallel? |
| :--- | :--- | :--- | :---: |
| **Prisma Schema & Shared Types** | Creates contracts & pushes to repo | Reviews & imports types | ⏳ **Dev 2 waits for Step 1 push** (est. 1-2 hours) |
| **Login Logic & Screen** | Writes `/auth/login` endpoint & JWT | Builds Login Page UI & Form validation | ✅ **100% Parallel** (Dev 2 mocks API response) |
| **Staff CRUD & Team Screen** | Writes `/users` endpoints & role guards | Builds `/team` table & "Add Coordinator" modal | ✅ **100% Parallel** (Dev 2 uses mock data) |
| **End-to-End Auth Integration** | Verifies token signing & CORS | Hooks `apiClient` to real backend endpoints | ⏳ **Together at PR Gate** |

---

## 5. PR & Merge Checklist (Exit Gate for Module 1)

Before moving to Module 2, both developers must complete this checklist together:

- [ ] **PR 1.0 (Dev 1):** Shared contracts merged to `main` (`packages/database`, `packages/types`, `packages/validators`).
- [ ] **PR 1.1 (Dev 1):** Fastify backend auth & staff endpoints tested via Postman/Thunder Client.
- [ ] **PR 1.2 (Dev 2):** Admin frontend connected to Fastify backend:
  - [ ] Super Admin logs in -> redirected to `/dashboard` with full sidebar menu.
  - [ ] Coordinator logs in -> redirected to `/dashboard` with coordinator-specific menu.
  - [ ] Admin creates a new coordinator and assigns 2 services (e.g. Visa + Flights) with a phone number -> coordinator appears in staff table.
  - [ ] Coordinator changes availability to `Busy` -> status updates immediately.
- [ ] No TypeScript build errors across all workspaces (`npm run build`).
- [ ] Both PRs approved and merged into `main`.
