# Deployment

## Backend on Railway

1. Create a Railway service from this repository.
2. Set the root build command from `infra/railway/railway.json`.
3. Add `DATABASE_URL`, `REDIS_URL`, JWT secrets, and provider credentials.
4. Run `npm run db:migrate -w packages/db` once before the first production boot.

## Frontend on Vercel

1. Create a Vercel project using `apps/web`.
2. Set `NEXT_PUBLIC_API_URL` to the Railway API URL plus `/api/v1`.
3. Deploy with `npm run build -w apps/web`.

## Database on Neon

1. Create a Neon PostgreSQL project.
2. Require SSL.
3. Store the connection string in Railway as `DATABASE_URL`.
4. Schedule backups and retention according to college policy.
