<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Development & Build Rules

- **DO NOT RUN FULL BUILDS ON ITERATIONS**: Never execute `npm run build` or `turbo run build` across the monorepo during routine iteration turns. Full monorepo builds consume excessive CPU, memory, and time. Only run a build when explicitly requested by the user before final delivery or verification.
- **Real-Product Standard**: All actions modifying server state (adding, reordering, deleting, toggling visibility) must await backend confirmation and refetch fresh data before showing success notifications or closing confirmation modals.
