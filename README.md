# AeroResponse

Volunteer pilot and mission coordination platform for Props for a Purpose.

## Milestone 1 scope

- Fresh Next.js 14 (App Router) + TypeScript project
- Credentials-based authentication (NextAuth.js) backed by Postgres via Prisma
- Protected dashboard shell (sidebar, header, sign-out)
- Database connection wired up, one migration (`users` table)
- Netlify deployment configuration

Organizations, Pilots, Aircraft, Missions, and matching are **not yet
implemented** — they arrive in Milestones 2-4 per the project plan.

## Local setup

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, NEXTAUTH_SECRET, SEED_ADMIN_* values

npm run db:migrate:deploy   # applies prisma/migrations/00000000000000_init
npm run db:seed             # creates the first ADMIN user from SEED_ADMIN_*
npm run dev
```

Visit `http://localhost:3000`, you'll be redirected to `/login`. Sign in with
the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` you set in `.env`.

## Production build

```bash
npm run build
npm start
```

`npm run build` runs `prisma generate` before `next build`, so a valid
`DATABASE_URL` must be set (a live connection is not required for `generate`,
only a syntactically valid schema).

## Deploying to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**.
3. Netlify will detect `netlify.toml` (build command `npm run build`,
   `@netlify/plugin-nextjs` plugin already configured).
4. Set environment variables in Netlify (Site settings → Environment
   variables): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your Netlify
   site URL), and the `SEED_ADMIN_*` values if you plan to seed from a CI step.
5. Run the migration against your production database once
   (`npm run db:migrate:deploy` from a machine/CI job with the production
   `DATABASE_URL`), then seed the first admin user.

## Notes

- Sessions use JWTs (no `Session`/`Account` tables needed) since this is a
  single-tenant internal tool with email/password login, not social login.
- `prisma/schema.prisma` intentionally only contains the `User` model right
  now — `Organization`, `Pilot`, `Aircraft`, and `Mission` models are added in
  Milestone 2/3 so the schema never gets ahead of the UI that uses it.
