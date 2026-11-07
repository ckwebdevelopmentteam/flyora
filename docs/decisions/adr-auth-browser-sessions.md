# Browser authentication sessions

Status: implemented, 2026-10-23.

Flyora previously persisted both JWTs in localStorage, used the same signing configuration for access and refresh, accepted refresh JWTs as bearer tokens, and had no revocable server session. The admin client also left concurrent callers waiting forever when refresh failed.

Use a 15-minute, issuer/audience-checked access JWT in memory and an opaque, authenticated refresh token in an HttpOnly cookie. A new `AuthSession` table stores only an HMAC of the secret, with an absolute seven-day expiry. Refresh and access credentials are deliberately different formats and keys. No business table, role enum, permission rule, or business route changes are required.

Refresh rotations acquire a PostgreSQL row lock. A caller supplies a random operation UUID; deterministic keyed successors permit recovery from a lost response for 30 seconds, using either the predecessor or current cookie. Replaying an authentic stale token outside that operation/window revokes the session. A MAC on the whole refresh credential prevents someone who knows a JWT's session ID from forging a refresh and revoking another person's session. Revocation is committed before returning an authentication error.

API guards verify the JWT, active session, ownership and current active user, then hydrate the current role from PostgreSQL. Browser role checks remain presentation helpers. Logout revokes one session immediately, invalidating its outstanding access tokens too.

All mutating auth endpoints require an exact allowlisted Origin, including login. CORS uses explicit application origins. Production refresh cookies use `__Host-flyora_refresh; Secure; HttpOnly; SameSite=Lax; Path=/` without Domain. Auth responses use `Cache-Control: no-store`. No refresh value is returned as JSON. Deploy frontend and API under the same site (for example admin.example.com and api.example.com); arbitrary cross-site deployments need a separate cookie/CSRF design.

The React client removes the legacy persisted state, restores the session through refresh before rendering routes, deduplicates refresh in a shared promise, and serializes tab auth operations with Web Locks. Only a non-secret pending operation UUID goes into localStorage. BroadcastChannel propagates login/logout changes without tokens. Generation checks reject responses from an old session, and React Query is cleared when the session changes. Network/5xx failures remain retryable; a failed logout is shown to the user and is not claimed as successful. No business mutation is replayed except after a 401 from the auth pre-handler, and at most once.

Rate limiting uses Fastify's in-process store. A multi-instance deployment needs a shared rate-limit store or equivalent gateway limits. Trust proxy is deliberately not globally enabled: configure only known proxies when deploying behind one. The session database query on each protected call is the intentional cost of immediate revocation and current roles.

The repository had no migration history. The baseline migration recreates the exact prior schema; existing databases must mark it applied after verifying their schema, then deploy the separate additive session migration. See [deployment and recovery](../AUTHENTICATION.md).

References: [OWASP storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [RFC 9700 rotation/replay guidance](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14), [Fastify cookie](https://github.com/fastify/fastify-cookie), [Prisma 6 baselining](https://docs.prisma.io/docs/orm/v6/prisma-migrate/workflows/baselining). This is first-party password authentication and session management, not an OAuth authorization server or an OIDC provider integration.
