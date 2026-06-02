# Deployment Strategy

> Infrastructure, environments, CI/CD, and release process.

---

## Environments

| Environment | Purpose | Deployment |
|---|---|---|
| `local` | Developer machines | `npm run dev` |
| `preview` | PR previews | Vercel auto-deploy per PR |
| `staging` | Pre-production validation | Vercel: manual deploy |
| `production` | Live users | Vercel: merge to `main` |

---

## Phase 1 Infrastructure

```
GitHub repo
  ↓ push to main
Vercel (auto-deploy)
  ├── Next.js app
  └── API routes (serverless functions)
        ↓
Neon (serverless Postgres)
  └── forgeMinds_production DB
```

Cost at Phase 1: ~$0 (Vercel hobby + Neon free tier).

---

## Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://forgeMinds.com

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AI
ANTHROPIC_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://forgeMinds.com
NODE_ENV=production
```

All secrets stored in Vercel Environment Variables UI.  
Local development uses `.env.local` (gitignored).

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test:
    steps:
      - lint
      - typecheck (tsc --noEmit)
      - unit tests (vitest)
      - integration tests (vitest + test DB)
      - build check (next build)
  
  e2e:
    needs: test
    steps:
      - playwright install
      - start test server
      - run E2E suite
```

Vercel's GitHub integration handles preview + production deploys automatically.

---

## Database Migrations in CI

```
Before deploy:
  npx drizzle-kit migrate --config drizzle.config.ts
```

Migration strategy:
- Never drop columns — add new ones, migrate data, deprecate old
- Always backward-compatible: new deploy works with old DB schema temporarily
- Zero-downtime: Next.js serverless functions update independently of DB

---

## Rollback Strategy

- **Code rollback**: Vercel one-click redeploy to previous deployment
- **DB rollback**: Only add/rename, never drop — rollback by redeploying old code
- **Content rollback**: world.json in version control — git revert

---

## Phase 3+ Infrastructure Changes

When extracting API to standalone service:
- Add Fly.io or Railway for Node service
- Add Upstash Redis for cache + rate limiting
- Cloudflare R2 for asset storage + CDN
- Update environment variables accordingly

---

## Monitoring

Phase 1: Vercel built-in analytics + error logs.  
Phase 3+: Sentry for errors, OpenTelemetry traces.  
Phase 6+: Grafana dashboard for custom metrics.

---

## Domain Strategy

- `forgeMinds.com` — production app
- `staging.forgeMinds.com` — staging environment
- `*.forgeMinds.com` — future creator subdomains or enterprise tenants
