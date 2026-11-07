# Flyora Travels — Developer 2 Master Plan & Detailed Checklist

**Owner:** Developer 2 (Frontend Admin Portal & Staff Workflows)  
**Target Workspace:** `apps/admin`  
**Git Branch:** `feat/m1-admin-auth-ui` (or `sahil`)  
**Backend API Target:** `http://localhost:5000/api/v1`  
**Last Updated:** October 2026

---

## 1. Quick Reference & Setup

### Tech Stack & Dependencies

- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`
- **Routing:** React Router v7 (`react-router-dom`)
- **State Management:** Zustand (`zustand/middleware` with `persist`)
- **Server State & Data Fetching:** TanStack Query v5 (`@tanstack/react-query`)
- **Tables:** TanStack Table v8 (`@tanstack/react-table`)
- **Forms & Validation:** React Hook Form (`react-hook-form`), `@hookform/resolvers/zod`, Zod
- **Shared Workspace Packages:** `@flyora/types`, `@flyora/validators`
- **Icons:** `lucide-react`

### Pre-Seeded Super Admin Credentials for Local Testing

- **Email:** `admin@flyora.com`
- **Password:** `FlyoraAdmin@2026`
- **Role:** `SUPER_ADMIN`

---

## 2. Module 1: Auth, Roles & Service-Coordinator UI

### Phase 1: Environment & API Client Infrastructure

- [x] **1.1. Environment Configuration**
  - [x] Create/verify `apps/admin/.env` containing:
    ```env
    VITE_API_URL=http://localhost:5000/api/v1
    ```
  - [x] Add `.env.example` inside `apps/admin/` for teammate documentation.

- [x] **1.2. HTTP API Client (`apps/admin/src/lib/apiClient.ts`)**
  - [x] Create Axios / Fetch-based client instance with `baseURL = import.meta.env.VITE_API_URL`.
  - [x] **Request Interceptor:**
    - [x] Read `accessToken` from `authStore`.
    - [x] If present, inject header: `Authorization: Bearer <accessToken>`.
  - [x] **Response Interceptor & Token Refresh:**
    - [x] Intercept `401 Unauthorized` responses.
    - [x] Ensure non-infinite retry loop (use an `_isRetry` flag).
    - [x] Call `POST /auth/refresh` with `refreshToken`.
    - [x] If refresh succeeds: update `authStore` with new `accessToken` and replay original request.
    - [x] If refresh fails: call `authStore.getState().clearAuth()` and redirect to `/login`.

- [x] **1.3. Zustand Auth Store (`apps/admin/src/stores/authStore.ts`)**
  - [x] Define state interface:
    - [x] `user: UserProfile | null`
    - [x] `accessToken: string | null`
    - [x] `refreshToken: string | null`
    - [x] `isAuthenticated: boolean`
    - [x] `isLoading: boolean`
  - [x] Implement actions:
    - [x] `setAuth(session: AuthSession): void` (saves user and tokens, sets `isAuthenticated = true`).
    - [x] `clearAuth(): void` (resets tokens and user, sets `isAuthenticated = false`).
    - [x] `setUser(user: UserProfile): void` (updates user details).
    - [x] `setAvailability(status: StaffAvailability): void` (updates current user availability).
  - [x] Wrap with Zustand `persist` middleware storing in `localStorage` under key `flyora_auth`.

- [x] **1.4. TanStack Query Provider (`apps/admin/src/main.tsx` or `src/App.tsx`)**
  - [x] Initialize `QueryClient` with:
    - `defaultOptions.queries.staleTime = 1000 * 60 * 5` (5 minutes).
    - `defaultOptions.queries.retry = 1`.
  - [x] Wrap application with `<QueryClientProvider client={queryClient}>`.

---

### Phase 2: Route Architecture & Guards

- [x] **2.1. Route Configuration (`apps/admin/src/routes/index.tsx` / `App.tsx`)**
  - [x] Set up React Router router using `createBrowserRouter` or `<BrowserRouter>`:
    - [x] `/login` (Public route)
    - [x] `/` (Protected root layout)
      - [x] Index: `/` → `DashboardPage.tsx`
      - [x] `/team` → `TeamPage.tsx` (Restricted to `SUPER_ADMIN`, `OPERATIONS_MANAGER`)
      - [x] `*` → `NotFoundPage.tsx`

- [x] **2.2. Route Protection Components**
  - [x] Create `ProtectedRoute.tsx`:
    - [x] Check `isAuthenticated` from `authStore`.
    - [x] If unauthenticated: redirect to `/login` with `state: { from: location }`.
    - [x] If authenticated: render `<Outlet />`.
  - [x] Create `RoleGuard.tsx`:
    - [x] Accept `allowedRoles: UserRole[]`.
    - [x] If current `user.role` not in `allowedRoles`: render Access Denied UI (or redirect to `/` with a toast notice).

---

### Phase 3: Login Screen UI (`apps/admin/src/pages/LoginPage.tsx`)

- [x] **3.1. Form & Schema Setup**
  - [x] Wire `react-hook-form` with `zodResolver(loginSchema)` from `@flyora/validators`.
  - [x] Type form values using `LoginInput`.

- [x] **3.2. Visual Interface & Design**
  - [x] Dark slate / branded visual palette matching Flyora identity.
  - [x] Flyora Travels logo and subtitle: _"Staff & Service Coordinator Portal"_.
  - [x] Inputs:
    - [x] **Email:** placeholder, validation error message, autofocus.
    - [x] **Password:** password visibility toggle (Eye/EyeOff icon), validation error message.
  - [x] Submit button:
    - [x] Disabled state during submission.
    - [x] Loading spinner indicator.
  - [x] Dismissible Error Banner for invalid credentials (401) or network failures.

- [x] **3.3. Authentication Logic**
  - [x] Implement API login with `@tanstack/react-query` / `apiClient`:
    - [x] Calls `POST /auth/login`.
    - [x] On success: saves response to `authStore.setAuth()`.
    - [x] Navigates to `/` (or `state.from` path).

---

### Phase 4: Application Shell, Header & Dynamic Sidebar

- [x] **4.1. Admin Top Header (`apps/admin/src/components/layout/Header.tsx`)**
  - [x] Brand name and mobile hamburger menu trigger.
  - [x] Staff profile badge:
    - [x] Full Name and Email.
    - [x] Role badge with custom colors (e.g. Purple for `SUPER_ADMIN`, Blue for `SERVICE_COORDINATOR`).
  - [x] **Staff Availability Dropdown Switcher:**
    - [x] Options:
      - 🟢 `AVAILABLE` ("Available")
      - 🟡 `BUSY` ("Busy")
      - ⚪ `OFF_DUTY` ("Off Duty")
    - [x] Action: calls `PATCH /users/:id/availability` with chosen status.
    - [x] Optimistically or reactively update `authStore.setAvailability()`.
  - [x] Logout button:
    - [x] Confirmation prompt / direct logout.
    - [x] Clears `authStore` and routes to `/login`.

- [x] **4.2. Dynamic Sidebar Navigation (`apps/admin/src/components/layout/Sidebar.tsx`)**
  - [x] Role-aware navigation list:
    - **For Super Admin & Operations Manager:**
      - [x] 📊 Dashboard (`/`)
      - [x] 👥 Team & Staff (`/team`)
      - [x] 📥 All Leads (Placeholder - Phase 3)
      - [x] 📄 Quotations (Placeholder - Phase 4)
      - [x] 💳 Bookings & Payments (Placeholder - Phase 5)
      - [x] 📦 Tour Packages (Placeholder - Phase 2)
    - **For Service Coordinators:**
      - [x] 📊 My Dashboard (`/`)
      - [x] 🎯 My Claimed Leads (Placeholder - Phase 3)
      - [x] 🏊 Service Lead Pool (Placeholder - Phase 3)
      - [x] 📝 My Quotes (Placeholder - Phase 4)
  - [x] Active route styling with `NavLink` (`isActive` styling).
  - [x] Clean icons from `lucide-react`.

- [x] **4.3. Master Shell Component (`apps/admin/src/components/layout/AdminLayout.tsx`)**
  - [x] Responsive flex/grid layout with fixed/collapsible sidebar and sticky header.
  - [x] Main content scroll container with smooth transitions.

---

### Phase 5: Dashboard Screen (`apps/admin/src/pages/DashboardPage.tsx`)

- [x] **5.1. Staff Greeting Card**
  - [x] Personalized greeting: _"Welcome back, {user.fullName}"_.
  - [x] Display staff's primary and assigned travel services as badges (e.g. _Visa Assistance_, _Holiday Packages_).
  - [x] Quick status overview banner showing current availability (`AVAILABLE`, `BUSY`, or `OFF_DUTY`).

- [x] **5.2. Role-Specific Metric Cards (Placeholders / Early Data)**
  - [x] For Admin: Total Staff members, Active Services count.
  - [x] For Coordinator: "Ready to take leads" banner and quick shortcuts.

---

### Phase 6: Team Management Screen (`apps/admin/src/pages/TeamPage.tsx`)

- [x] **6.1. Staff Table View**
  - [x] Data query using TanStack Query: `GET /users`.
  - [x] Columns:
    - [x] **Staff Member:** Full name & email address.
    - [x] **Phone Number:** Formatted phone string.
    - [x] **Role:** Styled badge (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SERVICE_COORDINATOR`, `ACCOUNTS`, `CONTENT_MANAGER`).
    - [x] **Assigned Services:** Tag chips displaying service names (highlighting `Primary` service).
    - [x] **Availability Status:** Status pill (🟢 `AVAILABLE`, 🟡 `BUSY`, ⚪ `OFF_DUTY`).
    - [x] **Status:** Active / Inactive badge.
    - [x] **Actions:** "Edit Services" button.
  - [x] Search filter input by name or email.
  - [x] Role filter dropdown (All, Admin, Coordinator, Accounts).

- [x] **6.2. "Add Staff Member" Modal (`apps/admin/src/components/team/AddStaffModal.tsx`)**
  - [x] Triggered by **"+ Add Staff Member"** header button.
  - [x] React Hook Form using `createUserSchema` from `@flyora/validators`.
  - [x] Form Fields:
    - [x] Full Name (text input)
    - [x] Email Address (email input)
    - [x] Phone Number (tel input)
    - [x] Password (password input, min 8 chars)
    - [x] Role Selector dropdown
  - [x] **Conditional Service Assignment (shown when role is `SERVICE_COORDINATOR`):**
    - [x] Fetch active services from `GET /services`.
    - [x] Multi-checkbox list of available services (e.g. _Visa Assistance_, _Holiday Packages_, _Flight Booking_, _Umrah & Hajj_).
    - [x] Primary Service radio selector.
  - [x] Submit mutation calling `POST /users`:
    - [x] Handles 400 validation / duplication errors.
    - [x] On success: invalidates `['users']` query cache and closes modal.

- [x] **6.3. "Edit Coordinator Services" Modal (`apps/admin/src/components/team/EditServicesModal.tsx`)**
  - [x] Open modal when clicking "Edit Services" on a coordinator row.
  - [x] Pre-populate currently assigned services and primary service.
  - [x] Submit mutation calling `PATCH /users/:id/services` with `{ serviceIds, primaryServiceId }`.
  - [x] On success: invalidates `['users']` query cache and displays success notification.

---

### Phase 7: Verification & Exit Gate for Module 1

- [x] **7.1. End-to-End Scenario 1: Super Admin Login & Staff Setup**
  - [x] Log in with `admin@flyora.com` / `FlyoraAdmin@2026`.
  - [x] Verify full admin navigation is visible.
  - [x] Navigate to `/team`.
  - [x] Create a new coordinator (e.g. `coordinator1@flyora.com`) with phone number and assign 2 services (e.g. _Visa Assistance_ and _Holiday Packages_).
  - [x] Verify new coordinator immediately appears in the staff table with correct badges.

- [x] **7.2. End-to-End Scenario 2: Coordinator Role & Availability**
  - [x] Log out of Admin account.
  - [x] Log in with newly created coordinator account.
  - [x] Verify sidebar hides `/team` (only shows coordinator items).
  - [x] Verify assigned services chips appear in Header / Dashboard banner.
  - [x] Toggle availability in Header from `AVAILABLE` to `BUSY`.
  - [x] Reload browser: verify status stays `BUSY` (persisted on server & local storage).

- [x] **7.3. Build & Quality Verification**
  - [x] Run `npm run build` from root: zero TypeScript compilation or Vite bundling errors.
  - [x] Run `npm run lint` from root: zero ESLint errors.
  - [ ] Commit changes adhering to commitlint convention:
    - Example: `feat(admin): implement login, protected layout, and team management ui`
  - [ ] Push to branch and open Pull Request into `develop`.

---

## 3. Developer 2 Roadmap for Future Modules

| Phase       | Module           | Dev 2 Deliverables (Admin UI)                                                                                                                                   |
| :---------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 2** | **Module 2 & 7** | Tour Package Builder, Itinerary step builder, Cloudflare R2 image upload dropzone component.                                                                    |
| **Phase 3** | **Module 3 & 4** | "Take Lead" Pool tab, atomic lead claiming button, Lead Details Drawer with client notes & stage selector (`New` → `Contacted` → `Quoted` → `Booked` → `Lost`). |
| **Phase 4** | **Module 5**     | Quotation Builder modal with manual item inputs (Hotel, Flight, Visa, Tour, Cab) and real-time **Margin Guard** progress indicator.                             |
| **Phase 5** | **Module 6**     | One-click Booking conversion, Offline Payment tracker (Bank UTR input), and in-browser R2 payment slip/receipt viewer.                                          |

---

## 4. Git Commit Message Conventions for Dev 2

```text
Format: <type>(<scope>): <subject>

Allowed types: feat, fix, docs, style, refactor, perf, test, chore
Allowed scopes: admin, auth, users, services, leads, quotes, bookings, deps, ui

Examples:
feat(admin): build login screen with react hook form and zod
feat(admin): implement protected layout with dynamic role sidebar
feat(admin): add staff table and coordinator service assignment modal
fix(admin): resolve 401 token refresh loop in api client interceptor
```
