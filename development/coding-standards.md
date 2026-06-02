# Coding Standards

> Engineering rules enforced across the entire codebase.

---

## TypeScript

- `strict: true` always — no exceptions
- No `any`. Use `unknown` + type guard if type is genuinely unknown
- Prefer `type` over `interface` for unions and computed types; use `interface` for extendable object shapes
- All function parameters and return types are explicitly typed
- No implicit `void` returns in async functions — always `Promise<void>` or `Promise<T>`

---

## File Naming

| Context | Convention | Example |
|---|---|---|
| React components | PascalCase | `QuestPanel.tsx` |
| Engine classes | PascalCase | `LearningEngine.ts` |
| Hooks | camelCase with `use` prefix | `usePlayerProgress.ts` |
| Stores | camelCase with `Store` suffix | `playerStore.ts` |
| Utilities | camelCase | `formatXP.ts` |
| API routes | `route.ts` | `app/api/player/route.ts` |
| Types | camelCase suffix `.types.ts` | `game.types.ts` |
| Schemas | camelCase suffix `.schema.ts` | `world.schema.ts` |
| Constants | `constants.ts` per module | `src/lib/constants.ts` |

---

## Imports

- Absolute imports via `@/` alias (maps to `src/`)
- No circular imports — enforce with ESLint `import/no-cycle`
- Import order (enforced by ESLint): 1. external, 2. internal absolute, 3. relative
- Never import internal engine files from outside the engine module — use `index.ts` exports only

---

## Component Rules

- One component per file
- Props interface defined in same file, above the component
- No inline styles — use Tailwind classes only
- No `style={{}}` unless PixiJS canvas sizing requires it
- Framer Motion variants defined outside the component as constants
- `'use client'` directive only when necessary — prefer Server Components

---

## Engine Rules

- Each engine module has exactly one `index.ts` — this is the public API
- Engine classes are instantiated once and exported as singletons
- Engine types live in `types.ts` in the same directory
- Engine modules do NOT import from `src/components`, `src/app`, or `src/store`

---

## State Rules

- Zustand stores are split by domain — never one mega-store
- Store actions (setters) are defined inside the store, not outside
- Derived state is computed with selectors, not stored
- TanStack Query is used for all server data — never `useEffect` + `fetch` manually

---

## API Rules

- All API responses use a consistent envelope:
  ```typescript
  { data: T, error: null } | { data: null, error: string }
  ```
- All API inputs validated with Zod before processing
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
- No business logic in route handlers — delegate to service functions in `src/lib/services/`

---

## Comments

- No inline comments explaining what code does — write readable code instead
- Comments only for: non-obvious invariants, workarounds for known bugs, performance reasoning
- JSDoc only on public engine interfaces and exported utility functions

---

## Git

- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commit format: `type(scope): message` — e.g., `feat(learning): add adaptive difficulty`
- No WIP commits to main — squash before merge
- Every PR touches docs if it changes architecture or adds a feature

---

## Testing

- Unit test files co-located: `LearningEngine.test.ts` next to `LearningEngine.ts`
- E2E tests in `tests/e2e/`
- Test names describe behavior: `'should award XP after stage completion'`
- No testing implementation details — test behavior through public interfaces
