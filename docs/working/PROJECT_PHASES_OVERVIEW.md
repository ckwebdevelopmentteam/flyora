# Flyora Travels — Project Phases Overview (2-Developer Roadmap)

**Team Size:** 2 Developers (Dev 1 & Dev 2)  
**Strategy:** Module-by-module delivery, shared contract first, parallel execution, clean PR gate before next phase.

---

## 1. Complete Phase Roadmap (7 Core Phases)

```
[Phase 0: Monorepo Foundation]
             │
             ▼
[Phase 1: Module 1 — Auth, Staff & Service-Coordinator RBAC]
             │
             ▼
[Phase 2: Module 2 & 7 — Services/Packages Catalog + Cloudflare R2 Storage]
             │
             ▼
[Phase 3: Module 3 & 4 — "Take Lead" Pool, Coordinator Alerts & Workspace]
             │
             ▼
[Phase 4: Module 5 — Quotation Builder & Margin Guard (Manual Rates + Shareable Link)]
             │
             ▼
[Phase 5: Module 6 — Booking & Manual Payment Tracking (R2 Receipts)]
             │
             ▼
[Phase 6: Module 8 — Public Next.js Website & SEO (Tour Pages, Click-to-WhatsApp)]
             │
             ▼
[Phase 7: End-to-End Integration, Role Audit & Production Deployment]
```

---

## 2. Phase Breakdown & Scope

| Phase | Core Modules Covered | Primary Deliverables | Exit Gate (When is it Done?) |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Foundation** | Turborepo setup, `apps/web`, `apps/admin`, `apps/api`, `packages/database`, `packages/types`, `packages/validators`. | Root `npm run dev` boots all apps without errors. |
| **Phase 1** | **Module 1** | Auth, Staff accounts, Roles, Service-Coordinator mappings, Admin Team settings. | Dev 1 & 2 can log in as Admin and Coordinator with correct permission views. |
| **Phase 2** | **Module 2 & 7** | Services & Tour Packages CRUD, Itinerary builder, Cloudflare R2 image upload service. | Admin uploads tour photos to R2 and publishes a package with full itinerary. |
| **Phase 3** | **Module 3 & 4** | "Take Lead" service pool, atomic claim locks, phone alert routing, coordinator notes & status. | Lead enquiry arrives; Coordinator clicks "Take Lead", locks it, and adds client notes. |
| **Phase 4** | **Module 5** | Quotation builder with manual flight/hotel inputs, Margin Guard check, `/quote/[token]` public link. | Coordinator creates quote; margin calculates; customer opens public link. |
| **Phase 5** | **Module 6** | One-click booking conversion, offline payment logs (bank UTR), R2 receipt proof upload & verification. | Booking converted; receipt uploaded to R2; Accounts marks payment verified. |
| **Phase 6** | **Module 8** | Public Next.js site, dynamic tour pages, Click-to-WhatsApp with package context, SEO meta & JSON-LD. | Public site loads tours from API with dynamic OpenGraph and fast Core Web Vitals. |
| **Phase 7** | **Final Launch** | Role security testing, Cloudflare CDN setup, staging deployment, environment variable audits. | Staging tested end-to-end with 8–10 staff test accounts. |

---

## 3. Rules of Collaboration for 2 Developers

1. **Shared Contract First:**  
   Before writing application code for any module, the Prisma schema (`packages/database`), shared TypeScript types (`packages/types`), and Zod validation schemas (`packages/validators`) must be established so neither developer gets blocked.
2. **Feature Branching:**  
   - `main` branch is always stable.
   - Each developer works on a feature branch (e.g., `feat/m1-api-auth` for Dev 1, `feat/m1-admin-auth-ui` for Dev 2).
3. **Never Push Directly to `main`:**  
   Always open a Pull Request (PR). The other developer must review and approve before merging.
4. **Mock First, Integrate Second:**  
   The frontend developer (Dev 2) develops against agreed TypeScript interfaces using mock state until the backend PR is merged. This prevents Dev 2 from sitting idle waiting for API endpoints.
