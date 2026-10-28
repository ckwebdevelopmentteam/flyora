# Module 5 — Dev 3 customer quotation page

Dev 3 owns the public proposal at `/quote/[token]`, not the quotation builder,
margin calculation, database, status mutations, or staff-side dispatch. The customer-page implementation is inside `apps/web/src/app/quote/` and this
component directory, as required by `DEV3_PUBLIC_WEB_CHECKLIST.md`. During browser
verification, the developer separately requested a small admin quantity-editing
fix and database workspace environment setup; those adjacent changes are listed
below and do not change the Module 5 ownership split.

## Implemented

- Dynamic server-rendered proposal using the anonymous
  `GET /api/v1/public/quotes/:shareToken` endpoint. Responses are fetched with
  `no-store`, no cookies/bearer headers, a timeout, and no redirect following.
- Branded loading skeleton, missing/gone link view, safe retry view, expired banner,
  and separate draft/accepted/rejected presentation. Only a current `SENT` quote
  offers new confirmation. Expiry updates while the page remains open and after
  returning to the tab.
- Customer greeting/reference/validity, grouped flights/hotels/visas/transfers/
  activities/other items, quantity-adjusted line totals, INR package total,
  inclusion/exclusion lists and coordinator identity.
- Coordinator WhatsApp intent and telephone links; no invented fallback numbers.
  The message includes coordinator, quote reference and service/destination.
  Opening WhatsApp does not mark the quote accepted or reserve a booking.
- Fixed mobile contact bar with bottom clearance/safe-area padding, sticky desktop
  summary, keyboard focus styles, reduced motion, and A4 print styles. Normal
  proposals are compact; longer item/description lists paginate naturally rather
  than being truncated to a fixed page count.
- Generic metadata/OpenGraph title and description, `noindex, nofollow`, no image
  indexing/snippets for Google and `no-referrer`, including loading/404 views.
  Customer names, totals and token URLs do not appear in metadata.

## API integration and strict boundaries

This branch includes `develop` through commit `fa75bf2`, including Dev 1's
quotation API, Dev 2's quotation builder and the later database startup logging
change. `PublicQuote` now directly reuses
`PublicQuotationView` from `@flyora/types`, omitting `shareToken` from rendered
props. Runtime validation remains in place; shared type assertions alone are not
a public-data security boundary.

Required response envelope:

```text
{ data: {
  quoteNumber, status, shareToken, totalPrice,
  items: [{ id, type, title, description?, quantity, sellingPrice }],
  inclusions, exclusions, validUntil, isExpired, createdAt,
  customerName, serviceTitle, serviceSlug,
  coordinator: { fullName, phone? }
} }
```

Amounts are INR major units, matching Dev 1's contract. Line totals use quantity;
quote totals must agree within one paise of the summed rounded line prices. Invalid
prices, duplicate item IDs, malformed dates/status/category or a mismatched token
fail safely with no proposal data. An upstream 404/410 uses the missing-link view;
network, 4xx permission/rate limit and 5xx failures use a retry view. Next.js may
return HTTP 200 for a streamed not-found UI; the upstream still returns 404 and the
page remains explicitly non-indexable.

`parsePublicQuote` rejects cost, margin and internal-note keys anywhere in the
payload and constructs an explicit field allowlist. Raw response objects and share
tokens are never passed as client component props. No upstream payload/error/token
is logged. No mock proposal is used as a production fallback. The synthetic JSON
fixture is imported only by tests and the explicit smoke-check script.

`NEXT_PUBLIC_API_URL` is the existing API base including `/api/v1`. A server-only
`API_INTERNAL_URL` can override it for private API networking or local smoke tests.
Neither URL should contain credentials. Ten-digit coordinator numbers use India's
country code 91; full international numbers are preserved.

### Remaining cross-developer integration

Dev 1's current public response does **not** expose travel date, adult/child count,
package title or destination. The page shows “To be confirmed” for missing trip
context, using the service title for the proposal heading. It already supports
optional `travelDate` (ISO timestamp), `numberOfAdults`, `numberOfKids`,
`packageTitle` and `destination` if Dev 1 adds them to the sanitized public contract.
Do not infer passenger counts from item quantities or invent itinerary details.

The merged backend creates quotes as `DRAFT`, and the builder immediately shows
a share dialog without publishing them. The public page correctly shows a draft
notice and “Request the Final Quote”. Confirmation is offered only for valid
`SENT` quotes. Dev 2's current UI has no publish/mark-sent control; that workflow
belongs to Dev 2 rather than this public page. Its API adapter exposes the status
update method, which was tested against the real API.

The admin adapter also has local mock fallbacks and caches quotation records in
localStorage; a share-success dialog alone does not prove a database save. A browser
tester must verify that the real create request returns 201 and the quote survives
reload. Do not make the public page read admin localStorage or render fake quotes.
Dev 2 also hardcodes its share-link origin to localhost:3000 or flyora.com; deployment
origin configuration is their integration follow-up.

The opt-in integration suite now uses the merged Dev 2 `quotesApi` and real auth/API
routes against an isolated local PostgreSQL database. It verifies a persisted
₹96,000 quote, DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED states, line quantities, anonymous
public reads, missing tokens and updated validity dates. It also starts the compiled
production Next app against that actual API and checks HTML, privacy metadata,
cache policy and zero internal-data/credential leakage. No mock fallback is accepted
as a successful create. Neither production/Neon data nor the other developers'
source files are modified by the integration suite. Human browser verification
is tracked below.

## Automated verification

From the repository root:

```sh
# Includes the existing 19 public-enquiry tests and new quotation tests.
npm run test:module3 --workspace=@flyora/web
# Quotation-only tests (no script/config changes outside Dev 3's directories).
npm exec --workspace=@flyora/web -- vitest run src/components/quote
npm run lint --workspace=@flyora/web
npm run build --workspace=@flyora/web
# Runs the compiled Next app against a synthetic local HTTP API, then stops both.
node apps/web/src/components/quote/verify-route.mjs
# Optional real cross-workspace integration, after building web and applying
# migrations to an isolated local PostgreSQL *_test database:
TEST_DATABASE_URL=postgresql://postgres:TEST_PASSWORD@localhost:55443/flyora_module5_test npm exec --workspace=@flyora/web -- vitest run src/components/quote/realFlow.integration.test.tsx
```

Unit/component tests cover contract validation and no-cost leakage, independent
line quantities, malformed payloads, expiry/closed statuses, missing coordinator
numbers, contact intents, print action, metadata, async server routing and retry.
The HTTP smoke test checks the actual production route for a valid quote, expiry,
404, 503 and an internal-cost response, including HTML metadata, no-store behavior,
no customer/internal-data leakage and no forwarded staff credentials. It does not
use Neon, production tokens, browser automation or send WhatsApp messages.

## Important manual checks

1. Create a real quotation with at least two item categories and quantity > 1.
   Open Dev 2's share link signed out. Check reference, customer, unit/line prices,
   total and coordinator against the builder. Reload and check a second quote to
   ensure data never crosses links.
2. Open a missing link, expire a quote, and temporarily stop the API. Confirm
   distinct not-found, expired and retry states. Expired/closed/draft quotes must
   never offer “Accept & Confirm”.
3. Open the WhatsApp link without sending: coordinator number, reference and
   service must be correct. Check the telephone link. If no valid phone exists,
   neither action should use a placeholder. Opening a link must not change status.
4. Check 375px/mobile, tablet and desktop. The fixed mobile bar must not cover the
   last content; all controls must work with keyboard and visible focus.
5. Print preview / Save PDF at A4: all prices and reference readable, no floating
   buttons, no cropped rows or blank trailing page. Test a normal and a longer quote.
6. Inspect document metadata and HTML/RSC: noindex/nofollow, generic OpenGraph,
   no supplier costs, margins, internal notes or staff credentials. Dev 1 should
   independently inspect the direct public JSON endpoint for the same guarantee.

## Browser verification tracking

Automated tests do not mark the manual checks above as complete. We will run them
one at a time and record the developer's reports here. Check 1 (live API/database
readiness) passed, confirmed by the developer on 2026-10-23: HTTP 200 with five
services. Check 2 (creation and public preview) also passed; the remaining
browser checks are pending.

First check: live API/database readiness at `http://localhost:5000/api/v1/services`.
This check now passes after the ignored local resolver workaround and restarting
the development server. The developer then created a real two-item quotation and
opened its shared customer page successfully.
A draft notice is expected for a newly created quote. Confirming a SENT quote comes
later, after a status update through the staff workflow/API.

A live environment probe during alignment found the local API responding but its
Neon queries returning connection errors. Resolve live connectivity before treating
admin success dialogs as proof of a persisted quote; the local test-database
integration is independent of that external connection.

### Alignment verification result

After updating to `9867f74`: 72 web tests (including five real database/API/Next
integration checks), 16 admin Module 5 tests and six backend quotation tests passed.
All three application builds and repository lint passed. The separate production
HTTP smoke check also passed all five synthetic response cases. The temporary local
PostgreSQL container and production-test servers were stopped afterward. Browser
verification was pending when these automated checks ran. Live API/database
readiness and the first quotation preview have since been confirmed manually;
the remaining browser checks are pending and are not included in the automated
pass claim.

### Local connectivity diagnosis

Browser readiness check 1 failed with Prisma's database-unreachable error. Both
ignored environment files pointed to the same Neon endpoint. Its IPv6 addresses
timed out, while IPv4 TCP/TLS and a Prisma `SELECT 1` probe using Linux resolver
option `no-aaaa` succeeded. An ignored local `apps/api/.env` entry now contains
`RES_OPTIONS="no-aaaa"`; a fresh API process using that file returned HTTP 200
with five services. The existing development process must be restarted to reload
that environment. This is a local network workaround, not a production default or
an application/database migration. No shared API source content was changed.

Browser check 1 result: **PASS**, reported by the developer on 2026-10-23. The services endpoint returned `statusCode: 200` and all five services after the development server restart.
Browser check 2 (real quotation creation and public preview): **PASS**, reported
by the developer on 2026-10-23. Quotation `FLY-2026-0001` showed the correct customer,
draft notice, customer contact actions and both line items. The entered flight
quantity was 2 at ₹28,000, and the hotel quantity was 4 at ₹39,989: ₹56,000 +
₹1,59,956 = ₹2,15,956. The larger total matches those inputs; it is not a pricing
or customer-page calculation failure. The missing travel date/passenger context
remains the documented backend contract limitation.

### Adjacent fixes explicitly requested during browser verification

- Admin quantity input: clearing `1` no longer immediately re-inserts it. A blank
  remains visible while editing; leaving it blank restores `1`. The underlying
  quote quantity stays numeric and positive, and replacement quantities update
  totals and the create payload. This is a narrow fix in Dev 2's builder, not a
  reassignment of the admin module to Dev 3.
- Database workspace: added an ignored private `packages/database/.env` using
  the same connection as the API, plus a credential-free `.env.example` and a
  setup README. Prisma validation and a read-only `SELECT 1` connection probe
  passed. No migrations or seeds were applied. The workspace file fixes Prisma
  command setup; the earlier API outage was the separate local IPv6 issue.

Adjacent-fix verification: all 19 admin Module 5 tests passed, including three new
quantity editing/totals/payload regressions. The admin TypeScript and production
build passed, with the existing bundle-size warning.

Manual quantity regression: **PASS**, confirmed by the developer on 2026-10-23.
Clearing `1`, replacing it with `2`, and leaving the field preserves `2`; leaving
it blank restores `1`.

Browser check 3 (anonymous customer access): **PASS**, confirmed by the developer
on 2026-10-23. The quotation opened and survived reload in a fresh private window
without an admin login, retaining the same customer, reference, items and total.

The core happy path is manually verified. The developer subsequently reported
that the remaining print/mobile/contact checks all worked on 2026-10-23, including
A4 print preview without cropped content or floating contact buttons. Failure and
expiry states have automated coverage; they were not separately reported as
manual browser checks. Do not treat that automated coverage as a manual pass.

## Dev 3 completion review

- Customer route, loading/missing/expired/unavailable states: implemented.
- Shared sanitized API contract, no-store anonymous requests, internal-cost and
  credential exclusion: implemented and covered by unit/HTTP/database integration.
- Grouped customer-facing proposal, totals, inclusions/exclusions, valid contact
  actions, responsive layout, print stylesheet and private metadata: implemented.
- Customer creation-to-preview flow, anonymous reload, quantity regression and
  remaining requested print/mobile/contact checks: developer-reported browser pass.
- Travel date/passenger context depends on Dev 1's public contract; the page uses
  explicit missing-data text and already supports those optional fields.
- Publishing a DRAFT quotation is a Dev 2 workflow handoff; the customer page only
  offers confirmation for an unexpired SENT quotation. This PR completes Dev 3's
  implementation against the merged contract, not every developer's Module 5 work.
