# Tech Stack

> Complete technology decisions with rationale.

---

## Frontend

### Next.js 15 (App Router)
- **Why**: SSR for landing/SEO, file-based routing, co-located API routes, Vercel-native deployment
- **Configuration**: `src/app/` with route groups `(auth)`, `(game)`, `(creator)`
- **Key feature used**: Server Components for initial data, Client Components for game UI

### TypeScript (strict mode)
- **Why**: end-to-end type safety, refactoring confidence, IDE support
- **Config**: `strict: true`, `noImplicitAny: true`, path aliases via `tsconfig.json`

### TailwindCSS v4
- **Why**: utility-first, JIT, zero dead CSS in production, CSS variables for theming
- **Game design tokens**: custom colors (`forge-gold`, `forge-dark`, `forge-void`), fonts, glow shadows

### Framer Motion
- **Why**: spring-physics animations, layout animations, gesture support, works seamlessly with React
- **Usage**: page transitions, XP bar fills, stage unlock effects, dialog enters/exits

### Phaser.js 3 (Phase 1.5+, replaces PixiJS for game canvas)
- **Why**: PixiJS is a renderer; Phaser is a complete game engine with built-in tilemap, physics, input, cameras, scene management, and animation systems — exactly what a tile-based 2D RPG requires
- **Previous choice**: PixiJS v8 (retained for Phase 1 compatibility shim — JSON without `tilemap` field falls back to PixiJS node-map)
- **Tiled integration**: Phaser reads Tiled JSON format (`.tmj`) natively — content creators can design worlds in Tiled editor, export JSON, and the engine renders it immediately
- **React coexistence**: Phaser renders to a `<canvas>` element; React DOM overlays (HUD, dialogue box, battle modal) sit on top via `position: absolute`. No conflict.
- **Bundle size**: Phaser 3 core ~1MB gzipped; acceptable for a game platform

### Tiled Map Editor
- **Why**: Industry-standard tilemap editor, free, exports JSON. Phaser 3 has first-class Tiled JSON support. Enables visual world design without code.
- **Usage**: Campaign creators design overworld and dungeon tilemaps in Tiled, export `.tmj` files, reference them in `world.json tilemap.tilemapPath`

### Zustand v5
- **Why**: minimal API, no providers needed, modular slices, Immer support, easy devtools
- **Alternative considered**: Jotai — rejected for lack of slice pattern clarity at scale

### TanStack Query v5
- **Why**: intelligent caching, background refetch, optimistic updates, offline support
- **Usage**: all server data fetching; Zustand mirrors server state for fast game reads

---

## Backend

### Next.js Route Handlers
- **Why**: zero extra infra in Phase 1, co-located with frontend, easy extraction later
- **Migration path**: Phase 3+ extracts to standalone Hono service if WebSockets needed

### Better Auth
- **Why**: TypeScript-native, self-hosted (no vendor dependency), supports email/password + OAuth, session-based
- **Alternatives considered**:
  - Clerk: fast but vendor lock-in, cost at scale
  - NextAuth v5: mature but verbose config, less TypeScript-first

---

## Database

### PostgreSQL 16
- **Why**: ACID, relational integrity, JSONB for flexible content metadata, excellent Drizzle support
- **Hosting**: Neon (serverless Postgres) for Phase 1; self-hosted on Railway/Fly.io for Phase 3+

### Drizzle ORM + drizzle-kit
- **Why**: TypeScript-native schema-as-code, zero runtime overhead, SQL-like query builder, excellent migration tooling
- **Alternative considered**: Prisma — heavier client, less transparent query generation
- **Schema location**: `src/db/schema/`

---

## Validation

### Zod
- **Why**: TypeScript-first, runtime + compile-time safety, shared between content loaders and API
- **Usage**: World/Knowledge JSON schemas, API request/response shapes, form validation

---

## AI

### Anthropic Claude API (via abstraction)
- **Why**: best reasoning for educational feedback, large context window for code explanation
- **Abstraction**: `AIAdapter` interface + `AnthropicProvider.ts` — swap provider in one file
- **Phase 1 usage**: hint generation only
- **Future**: evaluateAnswer, generateQuestVariant, procedural world generation

---

## Dev Tooling

| Tool | Purpose |
|---|---|
| ESLint + Prettier | code style enforcement |
| Vitest | unit + integration tests |
| Playwright | E2E tests |
| drizzle-kit | DB migrations |
| Husky + lint-staged | pre-commit hooks |
| tsx | TypeScript script runner (seeds, migrations) |
