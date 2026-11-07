# Module 3 — Dev 3 fixes and verification

Scope: public enquiry capture and WhatsApp entry points in `apps/web`; admin
master leads, reassignment and its activity drawer. Dev 2's coordinator workspace
and shared lead API methods are unchanged. No database migration is needed.

## Implemented

- Public form uses the shared enquiry schema plus stricter name, ten-digit phone,
  calendar date and passenger-count validation. Notes remain in the request body.
- Services must load successfully; failures offer a retry and block submission.
  No fabricated service IDs or enquiry reference IDs are used.
- Success requires the API's `success: true` and a nonempty lead reference.
  Failed submissions preserve inputs. Duplicate submits are blocked while pending;
  POST requests are never automatically retried. Closing is disabled while the
  write is pending. Requests time out; unmounted form requests are cancelled.
- Closing/reopening resets the form. Package enquiries retain their service/package
  context and cannot change to an unrelated service.
- Native modal dialogs provide focus containment, Escape dismissal and focus
  restoration. Public form controls have associated labels and validation feedback.
- WhatsApp destination comes from `NEXT_PUBLIC_WHATSAPP_NUMBER` in the web app's
  environment, using country code plus number (8–15 digits, no leading zero).
  Restart/rebuild the web app after changing it. Missing/invalid configuration hides
  WhatsApp links; the callback form remains available. No placeholder contact number.
- Master leads distinguish loading, empty and API failure states, with retries.
  Filter-option load errors are also visible. Unassigned mode ignores any retained
  coordinator filter. Filter changes reset pagination. The misleading page-only
  unassigned count was removed.
- Created-from/to filters include both local calendar dates, matching the displayed
  creation date. The current API does not support date parameters: the Dev 3 adapter
  reads all server pages for the other filters before filtering and paginating.
  It rejects failed/incomplete/changing page sets and requests narrower filters above
  10,000 matches. This is bounded frontend compatibility, not a server-side date index
  or snapshot guarantee. Dev 1 should add server-side date filtering for larger datasets.
- Reassignment offers only active `SERVICE_COORDINATOR` users mapped to the lead's
  service, excluding the current assignee. Selection resets between modal openings.
  Loading/empty/error states are explicit. Duplicate writes and closing while pending
  are blocked. Successful transfer invalidates master leads, lead detail/history and
  coordinator lead caches. Failed transfer stays open without a success notification.
- Admin history can retry failed requests. WhatsApp links add country code 91 to
  ten-digit Indian customer numbers, matching the Module 3 phone contract.

## Automated commands

Run from the repository root:

```sh
npm run test:module3 --workspace=@flyora/admin
npm run test:module3 --workspace=@flyora/web
npm run test:auth --workspace=@flyora/admin
npm run build
npm run lint
```

Tests use mocked HTTP responses and a simulated DOM. They do not write to Neon,
start application servers, or replace browser/integration testing. Native browser
focus behavior is specifically left for manual verification.

## Important browser checks

1. **Public enquiry → master leads:** submit with a real service, ten-digit phone,
   travel date and passenger counts. Confirm a real reference, exactly one new lead,
   correct customer/trip fields and `NEW` status in `/admin/leads`. Verify its presence
   in the coordinator's service pool as the cross-developer integration check.
2. **Validation and repeat use:** blank/whitespace name, nine/eleven-digit or alphabetic
   phone, adults 0/51 and children -1/21 must fail. Close and reopen: personal details
   and success state must be cleared. Repeated clicks while pending must send one POST.
3. **Network failure:** block the services request in DevTools: retry appears and
   submission stays disabled. Unblock/retry. Block/fail submission: no success reference,
   values retained, and configured WhatsApp fallback visible. After an ambiguous timeout,
   check whether the enquiry already exists before resubmitting.
4. **Filters and pagination:** combine service, coordinator, status, search and created
   dates. Check a same-day range, each boundary, an empty range, and a match originally
   on a later server page. Unassigned mode must work even after selecting a coordinator.
   A failed leads request must display an error, not “No leads found”.
5. **Reassignment:** active mapped coordinators only; inactive, other-service, current
   assignee and non-coordinator staff excluded. Test a service with no eligible targets.
   Cancel/reopen and switch leads: selection must be empty. Transfer once, then refresh:
   assignee and audit entry must persist, and the new coordinator sees the lead.
6. **Failure and access:** fail a transfer: dialog stays open, no success toast, retry
   possible. Super admin and operations manager can open `/admin/leads`; other roles
   must be denied via direct navigation too. This UI check does not prove API RBAC.
7. **Mobile/keyboard and WhatsApp:** use a narrow viewport, Tab/Shift+Tab inside each
   dialog, Escape and return focus. Fields, errors and submit button must remain reachable.
   Configure the real business WhatsApp number and confirm links point to it without
   sending a message. With no number, only the callback option should appear.

## Dev 1 / Dev 2 dependencies still open

These are not fixed by frontend eligibility checks and prevent marking the entire
Module 3 integration complete:

- **Dev 1: public notes persistence.** `submitPublicEnquiry` accepts `notes` but does
  not persist them. Dev 3 submits the field correctly. Include a distinctive note in
  the end-to-end test; it will not appear in history until Dev 1 fixes persistence.
- **Dev 1: reassignment validation and atomic audit.** The endpoint checks that the
  target exists, but must enforce active status, coordinator role and service membership
  itself. Lead update and activity insertion should be one transaction. Frontend
  filtering is a usability constraint, not an authorization boundary.
- **Dev 1: lead ownership/service authorization.** The earlier API audit found unrelated
  authenticated staff could read/update/note leads and coordinators could claim another
  service's lead. Require resource-specific authorization on the API.
- **Dev 1 / Dev 2: activity route mismatch and mock fallbacks.** The coordinator client
  calls `/leads/:id/activities`, which is absent, and its error paths fall back to mocks.
  The Dev 3 history drawer uses the existing real lead-detail endpoint instead.
- Coordinator alert delivery remains a backend console stub. This change does not
  implement or send WhatsApp/SMS notifications.
