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

#### Step 0: Git Hooks, Linting & Commit Conventions Setup (Dev 1 sets up for the repo)

- [ ] Install & initialize **Husky**:
  - [ ] `.husky/pre-commit`: runs `npx lint-staged` before any commit.
  - [ ] `.husky/commit-msg`: runs `npx --no -- commitlint --edit ${1}` to enforce proper commit messages.
- [ ] Install & configure **Commitlint** (`@commitlint/cli`, `@commitlint/config-conventional`):
  - [ ] Create `commitlint.config.js` with standard conventional commit scopes (`auth`, `users`, `services`, `leads`, `quotes`, `bookings`, `payments`, `db`, `deps`, `docs`).
- [ ] Configure **lint-staged** in root `package.json`:
  - [ ] `*.{ts,tsx,js,jsx}`: runs `eslint --fix` and `prettier --write`.
  - [ ] `*.{json,md,yaml}`: runs `prettier --write`.
- [ ] **Commit Message Standard (Enforced by Git Hook):**
  ```text
  Format: <type>(<optional scope>): <subject>

  Allowed Types:
    feat     : A new feature
    fix      : A bug fix
    docs     : Documentation only changes
    style    : Formatting, missing semi-colons, etc (no code logic change)
    refactor : Code change that neither fixes a bug nor adds a feature
    perf     : Performance improvement
    test     : Adding or fixing tests
    chore    : Build tasks, package updates, tooling configs

  Examples:
    feat(auth): add fastify jwt authentication and login endpoint
    feat(users): add service-coordinator mapping endpoints
    fix(auth): handle expired token refresh error cleanly
    docs(plan): add 2-developer work split and husky setup
    chore(lint): configure husky and commitlint conventional rules
  ```

#### Step 1: Base Contracts (Shared with Dev 2 first)

- [x] Write `packages/database/prisma/schema.prisma` for Module 1:
  - [x] `User`, `UserRole` (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR`, `ACCOUNTS`, `CONTENT_MANAGER`)
  - [x] `StaffAvailability` (`AVAILABLE`, `BUSY`, `OFF_DUTY`)
  - [x] `Service` (name, slug, minMarginPercent)
  - [x] `UserService` (mapping user to services with `isPrimary`)
- [ ] Run Prisma migration: `npx prisma migrate dev --name init_auth_services` (pending local DB credentials).
- [x] Define shared TypeScript interfaces in `packages/types/src/auth.ts` and `service.ts`.
- [x] Define shared Zod schemas in `packages/validators/src/authSchema.ts` (loginSchema, createUserSchema).
- [x] **PR / Push Milestone 1.0:** Base contracts created & merged to `develop`.

#### Step 2: Fastify App & Auth Infrastructure

- [x] Scaffold `apps/api` with Fastify + TypeScript.
- [x] Register `@fastify/jwt` and `@fastify/cors`.
- [x] Implement password hashing using `bcryptjs`.
- [x] Create database seed script (`packages/database/src/seed.ts`) with:
  - [x] Default Super Admin account (`admin@flyora.com` / `FlyoraAdmin@2026`).
  - [x] Initial Services seed (_"Holiday Packages"_, _"Visa Assistance"_, _"Flight Booking"_, _"Umrah & Hajj"_, _"Hotel Booking"_).
  - [x] Sample coordinators with phone numbers for Visa and Holidays.

#### Step 3: Auth Endpoints (`apps/api/src/modules/auth`)

- [x] `POST /api/v1/auth/login` — Validate email/password, issue JWT access + refresh tokens.
- [x] `GET /api/v1/auth/me` — Return current logged-in user details, role, and assigned services.
- [x] `POST /api/v1/auth/refresh` — Refresh expired access token using refresh token.

#### Step 4: Staff & Service-Coordinator Endpoints (`apps/api/src/modules/users`)

- [x] `GET /api/v1/users` — List staff with their roles, availability, and assigned services (Admin only).
- [x] `POST /api/v1/users` — Create/invite staff member with role, phone number, and service mappings.
- [x] `PATCH /api/v1/users/:id/services` — Update coordinator's assigned services.
- [x] `PATCH /api/v1/users/:id/availability` — Toggle `AVAILABLE` | `BUSY` | `OFF_DUTY`.

#### Step 5: Middleware & Guards (`apps/api/src/middleware`)

- [x] `authenticate` middleware (verifies JWT token from Authorization header).
- [x] `requireRole(roles[])` guard (blocks unauthorized roles).

---

## 3. Developer 2 Checklist (Frontend Admin Portal & UI)

### Branch Name: `feat/m1-admin-auth-ui`

#### Step 1: Admin App Scaffolding

- [x] Scaffold `apps/admin` (Vite + React 19 + TypeScript + Tailwind CSS).
- [x] Set up React Router with routes:
  - [x] `/login` (Public)
  - [x] `/` (Dashboard root - Protected)
  - [x] `/team` (Staff & Coordinators - Admin only)

#### Step 2: State & API Client

- [x] Install & configure `@tanstack/react-query`.
- [x] Configure `zustand` store (`src/stores/authStore.ts`):
  - [x] Stores: `user`, `accessToken`, `isAuthenticated`.
  - [x] Actions: `setAuth()`, `clearAuth()`, `setAvailability()`.
- [x] Setup Axios / Fetch API client (`src/lib/apiClient.ts`):
  - [x] Request interceptor: attaches `Authorization: Bearer <token>`.
  - [x] Response interceptor: handles 401s by triggering token refresh or redirecting to `/login`.

#### Step 3: Login Screen UI

- [x] Build clean, responsive login page:
  - [x] Email and Password inputs using React Hook Form + shared Zod schema.
  - [x] Error message alerts (e.g. "Invalid credentials").
  - [x] Loading spinner on submit.

#### Step 4: Protected Layout & Shell

- [x] Build Admin Layout (`src/components/layout/AdminLayout.tsx`):
  - [x] **Sidebar:** Dynamic navigation based on role:
    - Admin/Manager sees: _Dashboard, All Leads, Quotes, Bookings, Payments, Team Settings_.
    - Coordinator sees: _My Leads, Service Pool, Quotes_.
  - [x] **Header:**
    - Staff name & Role badge (e.g., `Holiday Packages Coordinator`).
    - Availability Dropdown toggle: 🟢 `Available` | 🟡 `Busy` | ⚪ `Off-Duty`.
    - Logout button.

#### Step 5: Team Management Screen (Admin Only) (`/team`)

- [x] Staff List Table (Name, Email, Phone, Role badge, Assigned Services badges, Availability status).
- [x] "Add Staff Member" Modal:
  - [x] Name, Email, Phone Number, Password.
  - [x] Role selector dropdown (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR`, `ACCOUNTS`, `CONTENT_MANAGER`).
  - [x] Multi-select service checklist (e.g. ☑️ _Visa Assistance_, ☑️ _Holiday Packages_) with Primary toggle.

---

## 4. Parallel Work vs. Waiting Dependencies

| Task Item                        | Dev 1 (Backend)                         | Dev 2 (Frontend)                               |                Can Work in Parallel?                |
| :------------------------------- | :-------------------------------------- | :--------------------------------------------- | :-------------------------------------------------: |
| **Prisma Schema & Shared Types** | Creates contracts & pushes to repo      | Reviews & imports types                        | ⏳ **Dev 2 waits for Step 1 push** (est. 1-2 hours) |
| **Login Logic & Screen**         | Writes `/auth/login` endpoint & JWT     | Builds Login Page UI & Form validation         |   ✅ **100% Parallel** (Dev 2 mocks API response)   |
| **Staff CRUD & Team Screen**     | Writes `/users` endpoints & role guards | Builds `/team` table & "Add Coordinator" modal |     ✅ **100% Parallel** (Dev 2 uses mock data)     |
| **End-to-End Auth Integration**  | Verifies token signing & CORS           | Hooks `apiClient` to real backend endpoints    |             ⏳ **Together at PR Gate**              |

---

## 5. PR & Merge Checklist (Exit Gate for Module 1)

Before moving to Module 2, both developers must complete this checklist together:

- [x] **PR 1.0 (Dev 1):** Shared contracts merged to `main` (`packages/database`, `packages/types`, `packages/validators`).
- [x] **PR 1.1 (Dev 1):** Fastify backend auth & staff endpoints tested via Postman/Thunder Client.
- [x] **PR 1.2 (Dev 2):** Admin frontend connected to Fastify backend:
  - [x] Super Admin logs in -> redirected to `/dashboard` with full sidebar menu.
  - [x] Coordinator logs in -> redirected to `/dashboard` with coordinator-specific menu.
  - [x] Admin creates a new coordinator and assigns 2 services (e.g. Visa + Flights) with a phone number -> coordinator appears in staff table.
  - [x] Coordinator changes availability to `Busy` -> status updates immediately.
- [x] No TypeScript build errors across all workspaces (`npm run build`).
- [x] Both PRs approved and merged into `develop`.
