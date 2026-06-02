# Phase 6 — Performance & Scale

> Prerequisites: Phase 5 complete.  
> Goal: production-grade performance, caching, CDN delivery, and observability.

---

## Goals

- Sub-100ms page loads for authenticated game routes
- CDN delivery for all static assets (sprites, backgrounds, audio)
- Database query optimization (indexes, query analysis)
- Edge caching for world/knowledge content
- Full observability stack (metrics, tracing, error monitoring)
- Load testing and capacity planning

---

## Deliverables

| # | Deliverable |
|---|---|
| 1 | CDN setup (Cloudflare or Vercel Edge) for `/public/assets` |
| 2 | Database index audit + new indexes on hot query paths |
| 3 | Redis cache for world/knowledge JSON (TTL-based) |
| 4 | Vercel Edge Functions for read-heavy API routes |
| 5 | Next.js ISR for world catalog pages |
| 6 | Bundle analysis + code splitting audit |
| 7 | PixiJS asset preloading + texture atlases |
| 8 | Error monitoring (Sentry) |
| 9 | Metrics dashboard (Vercel Analytics + custom) |
| 10 | Load test: 1000 concurrent players scenario |

---

## Performance Targets

| Metric | Target |
|---|---|
| LCP (game hub) | < 1.5s |
| TTI (stage view) | < 2.0s |
| API P99 latency | < 200ms |
| PixiJS world map render | < 16ms/frame |
| DB query P99 | < 50ms |

---

## Key Optimizations

### PixiJS
- Texture atlases: pack all stage node sprites into single atlas
- Lazy scene loading: only load sprites for current world
- Dispose unused textures on scene change

### Database
- Composite indexes: `(player_id, world_id)` on `stage_progress`
- Read replicas for leaderboard queries
- Connection pooling via PgBouncer

### Content Delivery
- World JSON served from Redis with 5-minute TTL
- On cache miss: load from DB → update Redis → serve
- On content update: invalidate specific world cache key

---

## Observability Stack

```
App → Sentry (errors) → PagerDuty (on-call)
App → OpenTelemetry → Jaeger (traces)
App → Prometheus metrics → Grafana dashboard
```

---

## Scalability Notes

- Redis cache layer is transparent to game engine — zero game logic changes
- Edge functions handle read paths; write paths remain on origin
- This phase unlocks the capacity needed for Phase 7 social features

---

## Migration Notes (to Phase 7)

- WebSocket infrastructure needed for real-time guild features — evaluate in Phase 6 tail
- Redis cache used for social presence in Phase 7
