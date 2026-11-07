# Database workspace environment

Copy `.env.example` to `.env` in this directory and set `DATABASE_URL` to the
same database used by `apps/api/.env`. Keep `.env` private; it is ignored by Git.
Prisma CLI commands run from this workspace load this file. The seed loads it
first, then falls back to the repository root `.env` for any unset variables.
Existing shell variables take precedence.

From the repository root:

```sh
npm run generate --workspace=@flyora/database
npm run migrate:deploy --workspace=@flyora/database
npm run studio --workspace=@flyora/database
```

Only run migrations against the intended database after reviewing pending changes.
For development seeding, set `ADMIN_BOOTSTRAP_PASSWORD` and `DEMO_STAFF_PASSWORD`
to 16–72 byte passwords, then explicitly run:

```sh
npm run seed --workspace=@flyora/database
```

Missing this file can prevent workspace Prisma commands from finding the database.
The API loads its own environment, so a missing database workspace file does not
explain an API connection failure when its `DATABASE_URL` is already configured.
On Linux networks where Neon IPv6 times out but IPv4 works, the local file can
include `RES_OPTIONS="no-aaaa"`. Use this only for that diagnosed local network
issue; it is not a required production setting.
