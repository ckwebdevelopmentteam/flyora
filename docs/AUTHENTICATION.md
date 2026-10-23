# Flyora authentication

The existing email/password login and staff roles are preserved. Staff must sign in again once when this update deploys: legacy JWTs are intentionally invalidated, and legacy localStorage credentials are removed by the updated admin app. Souqrima was used as a reference and is unchanged.

## Environment

Set distinct random `JWT_SECRET` and `JWT_REFRESH_SECRET` values of at least 32 characters; generate each independently with `openssl rand -hex 48`. Production rejects the old development defaults. Configure `ADMIN_APP_URL` and `WEB_APP_URL` to exact HTTPS origins. Configure `apps/admin/.env` using its example (`VITE_API_URL` includes `/api/v1`). Never put secrets in a `VITE_` variable.

The database connection previously committed in `.env.example` has been removed. Rotate that previously exposed Neon credential in Neon and update ignored deployment/local environment files; removing the example does not invalidate its Git history. The configured Flyora Neon database was backed up and migrated on 2026-10-23 after explicit approval. Existing users and business records were preserved.

Deploy API and admin under the same site, such as api.example.com and admin.example.com. The production HttpOnly cookie is host-only, Secure, SameSite=Lax and Path=/. Use HTTPS; cookie-bearing auth POSTs require Origin even for CLI callers. CORS is restricted to the two configured frontend origins.

## Migration: existing database (preserve data)

The currently configured Flyora database has already received the baseline marker and `20261023000000_auth_sessions`. The steps below are for other existing environments; do not recreate their existing business tables.

Back up and compare the deployed schema with `00000000000000_baseline/migration.sql`. That generated baseline represents this branch's prior schema, not a destructive replacement. If another branch has already changed tables or added migrations, reconcile its migration history first. Do not reset a shared database or mark a mismatching baseline applied.

The root `.env` is not automatically read by every npm workspace command. Supply `DATABASE_URL` from your environment/secret manager, preferably Neon's direct non-pooler endpoint for migrations. Do not paste credentials into checked-in commands or logs.

From the repository root, with the correct deployment URL exported:

```sh
npx prisma migrate resolve --applied 00000000000000_baseline --schema packages/database/prisma/schema.prisma
npx prisma migrate deploy --schema packages/database/prisma/schema.prisma
npx prisma generate --schema packages/database/prisma/schema.prisma
```

`migrate resolve` records the existing tables without recreating them. The second migration only adds `AuthSession`, its index and its user foreign key. For a brand new database, omit `migrate resolve` and run deploy plus generate; both migrations run normally.

Deploy API and admin together after the migration. Existing users, hashes and business records are retained; no data seed is required. Both clean database deployment and baselining an existing PostgreSQL 17 schema were tested locally, including a schema-drift comparison.

Recovery: prefer a forward code fix, leaving the additive session table in place. Revoke affected sessions if necessary. Do not restore the insecure bearer/refresh interchangeability as a rollback strategy. If abandoning this migration before rollout, remove the empty new table only in an explicitly coordinated database change; never reset business tables. Changing either signing key invalidates relevant credentials and requires sign-in. Schedule deletion of sessions whose `expiresAt` has passed; retain revoked rows until expiry to preserve replay evidence.

## Browser contract

| Endpoint                    | Request                                                | Response                                           |
| --------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| POST `/api/v1/auth/login`   | Origin plus JSON email/password                        | user, accessToken, accessExpiresIn; refresh cookie |
| POST `/api/v1/auth/refresh` | Origin, cookie, `X-Refresh-Operation` UUID, empty JSON | same public session; rotated cookie                |
| POST `/api/v1/auth/logout`  | Origin, cookie, empty JSON                             | success after revocation; cleared cookie           |
| GET `/api/v1/auth/me`       | Bearer access token                                    | current user/profile                               |

Use `credentials: include`. Keep access tokens only in memory. Never send refresh tokens in JSON. A refresh operation UUID may be retained across a temporary failure for 30-second response recovery; it is not a credential. A stale operation after the recovery window requires sign-in. Modern secure-context browsers provide Web Locks for serialization across tabs; older browsers without it can require sign-in again during competing refreshes.

403 permission failures never trigger refresh. 401 authentication failures refresh once; concurrent requests share the result and every waiter settles on failure. Temporary auth failures render a retry screen at startup. Logout failures remain visible and retryable. Account/role checks are enforced on the API from current database state, with no redesign of Flyora's RBAC rules.

## Local verification

Start a separate PostgreSQL 17 database with a name ending in `_test`, apply the migration chain with its URL explicitly supplied, then run from root:

```sh
TEST_DATABASE_URL=postgresql://postgres:TEST_PASSWORD@localhost:55439/flyora_auth_test npm run test:auth -w @flyora/api
npm run test:auth -w @flyora/admin
npm run build -w @flyora/api
npm run build -w @flyora/admin
```

The integration test refuses non-local or non-`_test` URLs and only deletes test-created users. No production credentials are needed. The tests cover transport, token separation, hashing, rotation, lost-response recovery, concurrency, replay, expiry, role hydration, disabled users, CSRF, logout and login rate limits. Client tests cover bootstrapping, single-flight failure, retryable outages, credential isolation, late responses and bounded retries.

The development seed now requires `ADMIN_BOOTSTRAP_PASSWORD` and `DEMO_STAFF_PASSWORD` (16–72 UTF-8 bytes) and refuses production. Existing passwords and administrator roles are preserved on rerun; sample data is still a development fixture. The login page no longer bundles demo credentials.

Dependency verification: the auth JWT library was updated to the patched Fastify-compatible major. `npm audit` still reports advisories in the existing Prisma 6, admin Tailwind 3, lint-staged and Next.js lint dependency trees. Upgrading those wider toolchains is outside this focused auth and Dev 3 change. The standalone starter pins a tested patched transitive dependency and its audit is clean.

Refresh latency handling: rotation explicitly allows 5 seconds to acquire a transaction and 10 seconds to execute it, instead of Prisma's 2/5-second defaults. The browser allows 20 seconds per refresh attempt and retries a transient network/500/502/503/504 failure once, reusing the same operation UUID. Definitive 4xx responses are not retried; replay checks and the 30-second recovery window are unchanged. A persistently unavailable API still shows the retry screen. No other business transaction timeouts are changed.

Login routing: after session verification, `/login` redirects authenticated users to `/` (or their saved protected-page destination) using history replacement. Signed-out users can use the login form; pending verification and temporary failures do not briefly display it. Logout returns to login.
