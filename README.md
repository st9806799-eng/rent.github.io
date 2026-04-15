# Rent Booking (Next.js + Prisma + PostgreSQL)

## Deploy to Vercel

1. Push repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. In Vercel Project Settings -> Environment Variables, add:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your public domain, for example `https://your-app.vercel.app`)
   - `TELEGRAM_BOT_TOKEN` (optional)
   - `TELEGRAM_BOT_USERNAME` (optional)
   - `TELEGRAM_WEBHOOK_SECRET` (optional, recommended for webhook protection)

## Why deployment works

- `vercel.json` uses `buildCommand: npm run build:vercel`.
- `build:vercel` runs:
  - `prisma generate`
  - `prisma migrate deploy`
  - `next build`
- This ensures schema migrations are applied before the app starts.

## Local commands

- `npm run dev` - start local development server.
- `npm run db:migrate` - create/apply a local migration during development.
- `npm run db:deploy` - apply existing migrations (production-safe).
- `npm run db:push` - sync schema without creating migration files.

## Vercel Cron

`vercel.json` contains hourly cron:
- `GET /api/cron/reminders`

For authorization, keep `CRON_SECRET` in Vercel environment variables.
