# Scaling Strategy

> How ForgeMinds scales from 10 users to 1M users without architectural rewrites.

---

## Scaling Tiers

### Tier 1: 0–10K Users (Phase 1–2)
- Single Next.js app on Vercel
- Neon (serverless Postgres) — autoscales on read load
- No Redis, no CDN beyond Vercel's built-in edge
- Cost: near-zero at this scale

### Tier 2: 10K–100K Users (Phase 3–4)
- Vercel Edge Functions for read-heavy API routes
- Add Redis (Upstash serverless) for session cache + AI rate limiting
- Neon read replicas for analytics queries
- CDN for assets (Cloudflare R2 + Workers)
- Cost: $100–500/mo depending on AI usage

### Tier 3: 100K–1M Users (Phase 5–6)
- Extract API to standalone Hono service (Fly.io or Railway)
- PostgreSQL primary + 2 read replicas
- PgBouncer for connection pooling
- Redis cluster for pub/sub (social features)
- Separate AI service for cost isolation and scaling
- CDN + asset optimization (texture atlases, WebP)
- Cost: $1K–5K/mo

### Tier 4: 1M+ Users (Phase 7–8)
- Microservices: Auth, Game, Content, AI, Social, Payments
- PostgreSQL sharding by user_id (or use CockroachDB)
- Kubernetes deployment
- Dedicated CDN origin for assets
- Enterprise: isolated tenants per organization
- Cost: scales with usage; estimate $0.002/active user/day

---

## Database Scaling Path

```
Phase 1: Single Neon DB (serverless, autoscales)
Phase 2: Neon with connection pooling
Phase 3: Add read replica for analytics
Phase 4: Separate DB for creator content
Phase 6: PgBouncer + Neon or dedicated Postgres
Phase 8: Sharded by user or organization
```

Never require a migration to move between tiers — the schema is forward-compatible.

---

## API Scaling Path

```
Phase 1: Next.js Route Handlers (serverless, auto-scales on Vercel)
Phase 3: Extract AI route to separate service (cost isolation)
Phase 5: Extract all API to standalone Hono service
Phase 7: Split into domain microservices
Phase 8: API Gateway + service mesh
```

**Key design decision**: API routes in Phase 1 are thin wrappers around service functions in `src/lib/services/`. This means extraction to a standalone service requires only moving the service files — route handlers become RPC proxies.

---

## Content Scaling Path

```
Phase 1: 1 world, JSON files in /content (static import)
Phase 2: 3 worlds, still static JSON
Phase 4: Worlds stored in DB (creator-authored)
Phase 5: CDN-served world bundles
Phase 8: Procedural + AI-generated content at runtime
```

---

## State Scaling Path

```
Phase 1: Zustand + localStorage (no server)
Phase 2: Zustand as cache + PostgreSQL as source of truth
Phase 3: Add Redis for session cache + AI rate limiting
Phase 7: Redis pub/sub for real-time social features
Phase 8: CRDT-based state for collaborative quests
```

---

## Horizontal Scaling Principles

1. API is stateless — session state in Redis, not in-process
2. PixiJS runs client-side — no server rendering of game state
3. Content files are immutable once published — safe to CDN cache indefinitely
4. AI calls are idempotent — retries don't cause side effects
5. Each service can be scaled independently
