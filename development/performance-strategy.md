# Performance Strategy

> Performance targets, measurement approach, and optimization techniques.

---

## Targets

| Metric | Target | Measurement |
|---|---|---|
| LCP (game hub) | < 1.5s | Lighthouse, Core Web Vitals |
| TTI (stage view) | < 2.0s | Lighthouse |
| CLS | < 0.05 | Lighthouse |
| API P99 latency | < 200ms | server logs |
| PixiJS frame time | < 16ms | Chrome DevTools |
| JS bundle (initial) | < 150KB gzip | `next build` output |
| World map load | < 500ms | custom timing |

---

## Phase 1 Performance Approach

Phase 1 is intentionally unoptimized — correctness first.  
Key constraints enforced from day 1 to avoid regressions:

1. PixiJS loaded only via `dynamic(() => import(...), { ssr: false })` — never blocks SSR
2. World JSON loaded lazily per world — not all worlds on initial load
3. Image assets served via Next.js `<Image />` with proper `sizes`
4. No synchronous `localStorage` calls on the render path

---

## Phase 6 Optimizations

### Bundle
- Run `next build --analyze` to identify heavy dependencies
- Code-split each world's content: dynamic imports per `worldId`
- Separate chunk for PixiJS (loaded only on game routes)
- Font subsetting for Cinzel and JetBrains Mono

### PixiJS
- Texture atlases: pack all stage-node sprites into one atlas per world
- Lazy load scenes: `WorldMapScene` loaded only when entering world map
- Dispose textures and sprites when leaving a scene
- Target 60fps; profile with Chrome Performance tab

### API
- Add `Cache-Control: s-maxage=60` to world catalog responses (rarely changes)
- PostgreSQL query explain/analyze on all hot paths
- Index all FK columns and composite query columns (see database-design.md)
- Connection pooling via PgBouncer or Neon's built-in pooler

### Edge Caching (Phase 6)
- Vercel Edge Cache for `/api/worlds` (world catalog)
- Redis for world/knowledge JSON (TTL = 5 minutes; invalidated on content update)
- Browser cache: TanStack Query `staleTime = 5 * 60 * 1000` for world data

---

## Measurement

### Custom Timing
```typescript
// Game-specific timing marks
performance.mark('world-map-start')
await sceneManager.push(new WorldMapScene(world))
performance.mark('world-map-ready')
performance.measure('world-map-load', 'world-map-start', 'world-map-ready')
```

### Observability (Phase 6)
- Sentry for error tracking and performance traces
- Vercel Analytics for Core Web Vitals
- Custom dashboard: stage load times, AI latency, DB query times

---

## Mobile Performance

- Test on low-end Android (Chrome): target 30fps minimum on PixiJS scenes
- Avoid CSS `filter` and `backdrop-filter` on elements that animate
- Use `will-change: transform` only on elements that are actively animating
- Reduce particle count by 50% on mobile (detect via `navigator.hardwareConcurrency <= 4`)
