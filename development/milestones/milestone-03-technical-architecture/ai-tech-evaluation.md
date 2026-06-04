# Phase 3.1 — Technology Evaluation

> **Phase:** 3.1 — Technology Evaluation
> **Purpose:** Evaluate technology options for the ForgeMinds stack and produce recommendations for decisions D-20, D-20A, D-21, D-22, D-23. No decisions are locked here.
> **Status:** ✅ DECISIONS LOCKED (2026-06-04) — D-20, D-20A, D-21, D-22 (Hybrid), D-23. Recorded in `DECISIONS.md` as D-20 through D-23.
> **Owned by:** AI
> **Input:** `package.json` (installed packages), `ai-phase-plan.md §Phase 3.1`, all M02 locked decisions

---

## Evaluation context

ForgeMinds is a story-driven RPG learning game built on Next.js 15 with React 19. Two game runtime candidates are already installed: **Phaser 3.90** and **PixiJS 8.9**. The Blueprint Viewer is built with React Flow (`@xyflow/react 12`). Zustand 5 is the installed state management library.

Every recommendation must serve these locked constraints:

| Constraint | Source | Implication |
|---|---|---|
| Beat-centric hierarchy (Campaign → Stage → Beat[]) | D-17 | Runtime iterates a typed Beat sequence — the engine never has named logic for "the dungeon" or "the boss" |
| Content-driven design | D-17, D-CA-AUTH | A new campaign must be playable without code changes — content drives behaviour |
| YAML authoring format | D-19 | Human authors write YAML; what the engine loads at runtime may differ |
| Challenge Pool B | D-18 | Engine must resolve challenges by Concept ID + difficulty filter, not by embedded reference |
| Theme system | D-CA-TV-1 | Engine applies ThemeOverrides at load time; gameplay logic never branches on theme identity |
| Knowledge mastery (write-once) | D-CA-07 | ENCOUNTERED/DEMONSTRATED/APPLIED mastery never erased, even on death |
| Failure teaches, never punishes | Pillar 3 | Save/restore boundary must preserve mastery across all failure events |

---

## Evaluation 1 — Game Runtime Technology

### 1.1 Phaser 3 (`phaser: ^3.90.0`)

Phaser is a full-featured 2D canvas game engine with its own game loop, scene management, physics, input, audio, camera, asset loading, and animation system.

**Strengths for ForgeMinds:**
- Mature, battle-tested for exactly this genre (top-down 2D RPG with tilemaps, sprites, animation, NPC interaction)
- Built-in scene manager maps naturally to Stage transitions
- Game Loop, Camera, Input, and Tilemap systems already solved — no reimplementation needed
- Active ecosystem; well-documented; large example library for JRPG patterns
- Version 3.90 is current and actively maintained

**Weaknesses for ForgeMinds:**
- Phaser owns the entire canvas and its own update loop — integrating with React's rendering model requires deliberate architecture (see D-21)
- Phaser's scene model is imperative; the Beat-centric content model is declarative. Bridging these cleanly requires a content-driven scene controller layer (not Phaser's default pattern)
- Bundle size: Phaser is ~1MB minified. For a web app where the Blueprint Viewer and game share a host, this is significant
- React 19 and Phaser do not natively compose — they operate on different rendering primitives

**Beat-centric compatibility:** Medium. Phaser's scene system can be used as the carrier for Beat sequences, but it takes explicit architecture to prevent Phaser-specific code from knowing about "Boss" or "Dungeon" beats. Achievable with a Beat controller layer.

**Rating against criteria:**

| Criterion | Score | Notes |
|---|---|---|
| Complexity | Medium | Phaser adds ~1MB + its own patterns; manageable |
| Scalability | High | Proven at JRPG scale |
| Learning Curve | Medium | Well-documented; existing team exposure |
| Content-Driven | Medium | Requires explicit Beat controller; not native |
| Blueprint Compatibility | Medium | Separate rendering contexts; shared types via adapter |
| Theme Compatibility | High | Assets/names applied at load time; Phaser is agnostic |
| AI Generation Compatibility | High | Stage content is data; Phaser just renders it |
| Long-Term Maintainability | High | Large community; active development |

---

### 1.2 PixiJS 8 (`pixi.js: ^8.9.2`)

PixiJS is a high-performance 2D **renderer** (WebGL-first, canvas fallback). It is not a game engine — it provides rendering, sprites, textures, and a basic scene graph, but no game loop, physics, input management, tilemap, audio, or scene management.

**Strengths for ForgeMinds:**
- Significantly lighter than Phaser (~300KB vs ~1MB)
- React-friendly: PixiJS renders to a canvas element that can live inside a React component; `react-pixi` libraries exist for declarative PixiJS composition
- High performance renderer — better WebGL utilisation than Phaser for complex visual effects
- Doesn't impose a scene model — the Beat-centric architecture can own scene management natively, without fighting against an engine's opinions

**Weaknesses for ForgeMinds:**
- It is a renderer, not an engine. ForgeMinds would need to build: game loop, input management, camera system, tilemap rendering, NPC pathfinding, audio management, scene transitions. This is substantial reimplementation work.
- The JRPG feature gap is wide: Phaser has built-in tilemap support (Tiled integration), camera follow, sprite animation sheets, input mapping. PixiJS has none of these out of the box.
- ForgeMinds is not a performance-limited application. The rendering headroom PixiJS provides (WebGL optimisation) is not a meaningful benefit at ForgeMinds' visual target.

**Beat-centric compatibility:** High — but only because you'd build the scene management yourself. The benefit comes at the cost of the implementation work.

**Rating against criteria:**

| Criterion | Score | Notes |
|---|---|---|
| Complexity | High | All engine infrastructure must be built |
| Scalability | High | If built well; high implementation risk |
| Learning Curve | Medium | Clean API, but engine patterns must be invented |
| Content-Driven | High | No preconceptions to fight |
| Blueprint Compatibility | High | Lighter bundle; easier React coexistence |
| Theme Compatibility | High | Same as Phaser |
| AI Generation Compatibility | High | Same as Phaser |
| Long-Term Maintainability | Medium | Custom engine code = custom maintenance burden |

---

### 1.3 React-only (no canvas game engine)

ForgeMinds rendered entirely in React: stages as React components, animations via Framer Motion (already installed), beats as component state transitions.

**Strengths:**
- Zero additional bundle; React is already the app foundation
- Blueprint Viewer, game, and tools share identical rendering model and state management
- Extreme composability — Beat components are just React components
- Framer Motion (installed) handles animation; React handles state and rendering

**Weaknesses:**
- React is not designed for a continuous update loop (60fps game loop). A panel-based RPG like Persona or 13 Sentinels is achievable; a smooth top-down explorer like Pokémon or Zelda is not.
- React's reconciler re-renders on state change — not ideal for frame-by-frame game state mutation (character position, NPC movement, camera pan)
- No built-in tilemap, sprite animation, camera, or physics
- The "adventure first, lesson second" vision (Pillar 4) needs a game-feeling interaction model, not web-app UX. React DOM rendering will always feel like a web app.

**Evaluation:** React-only is appropriate for visual-novel style presentation (static backgrounds, dialogue boxes, choice panels). It is not appropriate for a world the player explores with a character. Given the campaign design (regions to walk through, enemies to encounter, dungeons to navigate), React-only is insufficient.

**Rating:** Not recommended as the primary game renderer.

---

### 1.4 Phaser + React (hybrid)

Phaser owns the game canvas (scene rendering, game loop, input, tilemaps, sprites). React owns the application shell (main menu, settings, Blueprint Viewer, dialogue UI overlays, HUD elements). They communicate via events or a shared state layer.

**Strengths:**
- Gets the best of both: Phaser's proven JRPG capabilities for the game world; React's ecosystem for UI, tooling, and the Blueprint Viewer
- The game and its UI can be developed independently — React devs work on UI; game devs work on the Phaser layer
- This is the dominant pattern for web-based JRPG games in production

**Weaknesses:**
- Two rendering systems (canvas + DOM) must be managed simultaneously — potential z-index, focus, and input event conflicts
- The boundary between Phaser state and React state must be explicitly designed and maintained (see D-23)
- Slightly higher architectural complexity than pure React or pure Phaser

**Beat-centric compatibility:** High. A Beat Controller layer (React-side) reads the Beat sequence and drives Phaser scene transitions. Phaser executes; React orchestrates. The content model never enters Phaser's internals.

---

### 1.5 PixiJS + React (hybrid)

PixiJS renders the game world inside a React component. React manages all UI and application state. Custom game loop and engine infrastructure built on top.

**Strengths:**
- Tighter React integration than Phaser; PixiJS can be wrapped in React components more cleanly
- Lighter than Phaser

**Weaknesses:**
- All the PixiJS weaknesses above, plus: still requires a React/canvas boundary, just a lighter one
- The game infrastructure that must be built (tilemap, camera, NPC movement, audio) is the same whether PixiJS or Phaser handles rendering

**Evaluation:** PixiJS + React does not provide a meaningful advantage over Phaser + React for ForgeMinds' requirements. The lighter bundle does not compensate for the engine gap.

---

### Runtime recommendation

> **Phaser + React (hybrid)** is the recommended approach.

Phaser handles the game world (tilemaps, sprites, camera, input, scene management). React handles the application shell and UI. A Beat Controller layer (React-side) reads the campaign content model and drives Phaser. Phaser never knows about Beat types.

This recommendation is consistent with the existing `package.json` (both Phaser and React are already present) and with how successful web-based JRPG games are typically built.

---

## Evaluation 2 — Application Structure (D-20A)

### Option A — Single Next.js Application

One Next.js app hosts everything:
```
Next.js app
├── /game          — Phaser game runtime (canvas)
├── /tools/blueprints  — Blueprint Viewer (React Flow)
├── /tools/studio  — Future Content Studio
└── /             — Home, navigation
```

**Advantages:**
- Shared types, shared validation rules, shared UI components — no duplication
- One deployment, one domain, one auth context (when auth is added)
- Blueprint Viewer already lives at `/tools/blueprints` — this is already the A structure
- Content pipeline (YAML → Campaign object) is shared between the game and the viewer
- Local development: one `npm run dev`

**Disadvantages:**
- Phaser's ~1MB bundle loads for all users, even those only using the Content Studio
- Build configuration complexity grows as game, viewer, and studio have different requirements
- Code splitting is required to prevent game bundle from polluting non-game pages (manageable with Next.js dynamic imports)

---

### Option B — Split Applications

Two separate deployments:
- **Game Client:** optimised for players — Phaser, game content, save system
- **Content Studio:** optimised for creators — Blueprint Viewer, YAML editor, validation tooling

**Advantages:**
- Independent deployment and optimisation per use case
- Game client bundle is only game code; studio is only tooling code
- Different release cadences possible

**Disadvantages:**
- Shared types must live in a shared package (npm workspace or monorepo) — adds tooling overhead
- Two deployments to maintain, two development servers to run
- Blueprint Viewer is already in the game app — splitting introduces immediate migration work
- For v1 scope, the overhead of a split architecture is disproportionate to the benefit

---

### Application structure recommendation

> **Option A — Single Next.js Application**, with code splitting via Next.js dynamic imports.

The Blueprint Viewer is already in the app. Types are already shared. V1 does not need the operational complexity of split deployments. Code splitting (`next/dynamic` with `ssr: false` for the Phaser component) manages the bundle impact cleanly.

**Note:** Option B is the correct long-term architecture once a real Content Studio is being built. Design the Option A code structure so it can be split in the future without a major rewrite — specifically: keep game code, viewer code, and shared types in clearly separated directories.

---

## Evaluation 3 — React Integration Strategy (D-21)

### Option A — React shell + Phaser canvas (recommended)

React owns the DOM: main menu, loading screens, dialogue overlays, HUD, settings, Blueprint Viewer. Phaser owns a `<canvas>` element mounted inside a React component. Communication via a thin event bridge.

```
React App
├── <GameShell>        ← React component
│   └── <canvas>       ← Phaser mounts here (PhaserGame.tsx)
├── <DialogueOverlay>  ← React DOM, positioned over canvas
├── <HUD>              ← React DOM
└── /tools/blueprints  ← React Flow, no Phaser
```

**Why this works:**
- Phaser is instantiated once (`new Phaser.Game(config)`) with the canvas container as target
- React manages lifecycle: when the game route mounts, Phaser starts; when it unmounts, Phaser is destroyed
- Dialogue, HUD, and UI overlays are React DOM positioned over the canvas using CSS (`position: absolute`)
- The Blueprint Viewer (`/tools/blueprints`) never loads Phaser — clean code splitting

**Risks:**
- Input event capture: Phaser listens on the canvas; React dialogs/buttons over the canvas may need `e.stopPropagation()` discipline
- Z-index management: React overlays over the canvas need consistent z-index strategy
- Phaser destroy/remount: if the game component unmounts and remounts (route navigation), Phaser must be cleanly destroyed and recreated

---

### Option B — Full React game (no Phaser)

All game rendering in React + Framer Motion. Appropriate only if ForgeMinds' game world is static backgrounds + dialogue + choice panels (visual novel style).

**Rejected:** The campaign design requires a navigable world (regions, NPCs to find, dungeons to enter). A React-only game world would look and feel like a web app. Violates Pillar 4 (Adventure first).

---

### Option C — Phaser standalone (no React UI layer)

Phaser renders everything including UI (dialogue boxes, menus, HUD) using Phaser's own DOM/canvas text/graphics system.

**Rejected:** Phaser's UI capabilities are significantly weaker than React's. The Blueprint Viewer, the future Content Studio, and the app shell are all React. Rendering menus in Phaser would duplicate work and degrade quality.

---

### React integration recommendation

> **Option A — React shell + Phaser canvas.**

Phaser is mounted inside a single `PhaserGame.tsx` React component. React handles all DOM UI. A `GameEventBus` (thin event emitter) bridges Phaser ↔ React for events that cross the boundary (quest completed → update React HUD; player clicked dialogue option → send to Phaser game state).

---

## Evaluation 4 — YAML Content Loading Strategy (D-22)

### Option A — Runtime parsing (YAML parsed in-browser)

YAML files are loaded as raw text (`fetch('/content/stages/stage-01.yaml')`) and parsed in-browser using `js-yaml` at runtime.

**Advantages:**
- YAML files are the canonical source; no build step; hot-reload is trivial
- Authors edit YAML and immediately see changes in the running game (with a file watch server)
- No compilation step to configure or maintain

**Disadvantages:**
- `js-yaml` adds ~50KB to the bundle
- Every content load is asynchronous (network + parse) — must be managed in the content pipeline
- No TypeScript type safety at parse time — type errors surface at runtime, not build time
- YAML is served as static assets from the public folder or an API — may require a content server for large campaigns
- Browser YAML parsing is slightly slower than pre-compiled JSON (negligible at ForgeMinds' content scale, but non-zero)

---

### Option B — Build-time compilation (YAML → JSON/TypeScript at build)

A build step (custom Next.js plugin or Vite transform) reads all YAML files and compiles them to:
- Option B1: JSON files (still served as static assets, but pre-parsed)
- Option B2: TypeScript modules (content is imported directly as typed objects, no fetch required)

**Advantages:**
- Full TypeScript type safety at build time — schema errors are caught before deployment
- No runtime parsing overhead; no `js-yaml` bundle dependency
- TypeScript import path: `import stage01 from '@/content/stages/stage-01'` — no async loading for pre-built content
- Zod (already installed) can validate the compiled output at build time against the content schema

**Disadvantages:**
- Build step must be configured — adds tooling complexity upfront
- Hot-reload in development requires the build step to re-run on YAML change (watchable, but adds a step)
- Build time grows with content volume (manageable at ForgeMinds' scale)

---

### Option C — Hybrid (YAML in dev, compiled JSON in production)

Development uses runtime YAML parsing for hot-reload convenience. Production uses build-time compiled JSON for performance and type safety.

**Advantages:**
- Best DX in development (instant hot-reload); best performance in production
- Zod validation can run in both environments (on parse in dev; on compile in prod)

**Disadvantages:**
- Two loading paths to maintain — risk of dev/prod divergence
- The "dev parses, prod doesn't" gap can mask type errors that only appear in production

---

### YAML loading recommendation (updated — D-22 locked as Hybrid)

> **Option C — Hybrid: runtime parsing in development, build-time compilation in production.**

**Development environment:**
- YAML files parsed in-browser via `js-yaml` at runtime
- Content authors edit YAML and see changes immediately (file-watch server + browser refresh)
- No compile step on the hot path — authoring iteration is fast
- `js-yaml` is only bundled in the development build

**Production environment:**
- A build step (custom Next.js plugin or Vite transform) compiles all YAML content to TypeScript modules
- Zod schema validation runs at compile time — invalid content blocks the build
- No `js-yaml` in the production bundle
- Content imports are statically typed and tree-shakeable

**Why Hybrid over B2 (build-time only):** ForgeMinds is a content-heavy platform. A content author iterating on Stage 5's dialogue should not wait for a full YAML → TypeScript compile cycle between every edit. Development DX directly impacts content quality and velocity. The dev/prod difference is an environment flag, not a divergent code path — the same `Campaign` type is produced in both environments.

**Risk to manage in Phase 3.3:** The two loading paths must produce semantically identical `Campaign` objects. The Pipeline design must include a test that runs both paths against the same YAML and asserts identical output.

---

## Evaluation 5 — State Management Boundaries (D-23)

Three distinct state categories exist in ForgeMinds. The boundary between them is architecturally critical.

### Category 1 — Frame-level rendering state

**What it is:** Position of the player character, NPC animation frames, camera position, active particle effects, tile visibility. Changes 60 times per second.

**Where it belongs:** Inside Phaser's game loop, managed by Phaser GameObjects. This state is:
- Never persisted (doesn't go in saves)
- Never queried by React
- Never queried by the content system
- Ephemeral — reset on scene reload

**Zustand involvement:** None. Phaser owns this entirely.

---

### Category 2 — Session-level game state

**What it is:** Which Beat is currently active; which NPCs have been spoken to in this session; which enemies are defeated in the current stage; current HP; dialogue state; active quest step.

**Where it belongs:** Primarily in Phaser (scene-local game state), with a thin Zustand slice for the subset that React UI needs to display (HP for the HUD, active quest name for the quest tracker).

**Key design rule:** Session state resets when a new stage loads. It is not the same as progress state.

**Zustand involvement:** A `sessionState` slice — small, well-defined, used only by React UI components that overlay the game.

---

### Category 3 — Persistent progress state

**What it is:** ConceptMastery (ENCOUNTERED/DEMONSTRATED/APPLIED per concept), completed quests, discovered knowledge beats, player level and XP, inventory items, completed stages, CastMember dialogue states unlocked, campaign-scoped quest progress.

**Where it belongs:** Zustand `progressState` slice (or equivalent). This state:
- Is persisted to the save system
- Is queried at any time by the content pipeline (quest resolution conditions, mastery-gated traversal, dialogue branches)
- Survives stage transitions, deaths, and game restarts
- Is never ephemeral

**Zustand involvement:** Central. The `progressState` Zustand slice is the source of truth for all persistent progress. Both Phaser (via the event bridge) and React (directly) read from it.

---

### The critical boundary rule

> **Nothing in Category 1 (frame state) is ever promoted to Category 3 (progress state) directly.**

The promotion path is: Phaser fires a game event (e.g., `BEAT_COMPLETED`, `CHALLENGE_ANSWERED_CORRECTLY`) → `GameEventBus` → Zustand `progressState` action → state update → save system queues a write.

This keeps Phaser's internal state clean and ensures progress state changes are always intentional events, not frame-level mutations.

---

### State management recommendation

> **Zustand for Categories 2 (session, thin slice) and 3 (persistent progress, primary slice). Phaser for Category 1 (frame state).**

Zustand 5 (already installed) is appropriate. Its store model (multiple named slices) maps cleanly to the two Zustand categories. Its devtools support makes debugging progress state straightforward. It does not fight against React's rendering model.

**Not recommended:** Using React `useState` / `useContext` for persistent progress state. Context re-renders all consumers on every change — acceptable for UI, problematic for high-frequency game state queries.

---

## Recommendation matrix — ✅ ALL LOCKED (2026-06-04)

| Decision | Locked answer | Confidence |
|---|---|---|
| D-20: Game runtime | **Phaser + React hybrid** | High |
| D-20A: App structure | **Single Next.js app** | High |
| D-21: React integration | **React shell + Phaser canvas** | High |
| D-22: YAML loading | **Hybrid — runtime parse in dev, build-time compile in prod** | High |
| D-23: State management | **Phaser = frame state · Zustand session + progress · persistence layer** | High |

---

## Risks

### RISK-01 — Phaser + React input boundary (Medium)

When React DOM elements (dialogue boxes, buttons) are positioned over the Phaser canvas, input events can conflict. Clicking a React button while Phaser is also listening for canvas clicks requires explicit `event.stopPropagation()` discipline. This is a known, solvable problem — but requires architectural attention in Phase 3.2.

*Mitigation:* Define a clear input ownership model in Phase 3.2. When a React modal is open, Phaser input is suspended. When the game world is active, React overlays are pointer-events-none except for designated HUD elements.

---

### RISK-02 — Build-time YAML compilation setup cost (Low-Medium)

Option B2 (build-time compilation) requires a custom Next.js plugin or Vite transform that is not yet configured. This is one-time setup work, but it must be done correctly — a poorly designed build step causes slow builds and developer friction.

*Mitigation:* Phase 3.3 (Content Loading Pipeline) designs the build step explicitly. Implementation in Milestone 06 follows the design.

---

### RISK-03 — Phaser destroy/remount in Next.js (Medium)

Next.js App Router can unmount and remount components as the user navigates between routes. If the Phaser game component unmounts unexpectedly, Phaser must be properly destroyed to avoid canvas/event listener leaks. If the user returns to `/game`, Phaser must be recreated cleanly.

*Mitigation:* `PhaserGame.tsx` uses a `useEffect` with proper cleanup (`game.destroy(true)`). The game is a persistent-layout component in Next.js if navigation between game sub-routes is required.

---

### RISK-04 — Content schema type drift (Low)

If the build-time YAML → TypeScript compilation and `src/blueprint/data/types.ts` define the `Campaign` type in two different places, they will diverge. Phase 3.8 (Blueprint Runtime Integration) must address this explicitly.

*Mitigation:* Phase 3.8 decision D-31 (shared type strategy) must resolve this before implementation begins.

---

### RISK-05 — Phaser bundle size in non-game routes (Low)

Phaser is ~1MB. If it loads on the Blueprint Viewer route or the home page, performance suffers unnecessarily.

*Mitigation:* `next/dynamic` with `ssr: false` for the `PhaserGame` component ensures Phaser is only bundled for the `/game` route. This is standard Next.js code splitting — straightforward to implement.

---

## Future constraints established by these recommendations

The following constraints flow from Phase 3.1 recommendations into all subsequent phases:

1. **Phase 3.2 (Engine Architecture):** Must design around Phaser as the canvas engine and React as the UI/shell. Must include the input boundary model and the `GameEventBus` design.

2. **Phase 3.3 (Content Loading Pipeline):** Must design the YAML → TypeScript build step (Option B2). The pipeline architecture must accommodate Zod validation at compile time.

3. **Phase 3.4 (State Management):** Must partition state into exactly three categories. The `progressState` Zustand slice is the persistent state source of truth. The event bus model must be defined.

4. **Phase 3.5 (Save System):** Must persist `progressState` Zustand slice. Must never persist Phaser frame state. Must be queryable by the content pipeline at runtime.

5. **Phase 3.8 (Blueprint Runtime Integration):** Must resolve type sharing strategy (D-31) in the context of the build-time compilation approach from D-22.

6. **Milestone 06 (Core Engine):** Phaser + React hybrid is the implementation target. The `PhaserGame.tsx` component is the first code deliverable. The YAML build step is the second.

---

## Cross-references

- `milestones/milestone-03-technical-architecture/ai-phase-plan.md` — Phase 3.1 constraints and validation criteria
- `src/package.json` — installed packages evaluated in this document
- `src/blueprint/data/types.ts` — Campaign type definition that must be preserved through D-22 build pipeline
- `game-design/ai-vision.md §4 Pillar 4` — Adventure first, lesson second — drives rejection of React-only game
- `content-architecture/ai-beat-model.md` — Beat sequence the engine must iterate without named-slot logic
- `DECISIONS.md` — decisions D-20 through D-23 will be recorded here once approved
