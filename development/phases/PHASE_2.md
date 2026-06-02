# Phase 2 — Auth, Cloud Persistence & Campaign Library

> Prerequisites: **Phase 1.5 complete** (2D RPG engine, Phaser.js tilemap, per-campaign progression isolation).  
> Goal: move from local-only to cloud-backed, add full auth, and build the campaign library system.

---

## Goals

- Introduce auth (email/password + OAuth) — Phase 1 required none
- Replace localStorage persistence with PostgreSQL via Drizzle
- Build the campaign library: players save, revisit, and share campaigns they've loaded
- Ship player profile system (avatar, stats, history)
- Add "Recently Played" and campaign completion tracking to the hub
- Enable campaign sharing via shareable link

---

## Deliverables

| # | Deliverable | Notes |
|---|---|---|
| 1 | Auth flow | Better Auth: email/password + Google OAuth + email verification |
| 2 | PostgreSQL connection live | Local dev + hosted |
| 3 | Drizzle migrations for all schemas | Players, campaigns, progress |
| 4 | API routes: GET/POST /player, /campaigns, /progress | Replace localStorage reads/writes |
| 5 | TanStack Query wired to all API endpoints | Optimistic updates, stale-time config |
| 6 | Campaign persistence | User's loaded campaigns saved to DB with JSON configs stored as JSONB |
| 7 | Campaign library page | List of player's saved campaigns with last-played date, completion %, "Continue" button |
| 8 | Recently Played section | Hub shows last 5 campaigns with progress rings |
| 9 | Campaign metadata display | Name, topic, difficulty, estimated hours pulled from knowledge.json fields |
| 10 | Campaign sharing | Generate a shareable link — recipient opens it and the same JSON config is pre-loaded |
| 11 | Player profile page | Avatar, XP history, completed stages, campaign list |
| 12 | Campaign unlock progression | Finish a campaign → unlock next (prerequisite config from world.json) |
| 13 | Stage replay | Revisit completed stages for bonus XP |

---

## Architecture Changes

### Auth Integration

- Better Auth handles sessions, tokens, and OAuth callbacks
- All game routes under `(game)/` require an active session in Phase 2
- Campaign Hub shows authenticated player's saved campaigns instead of raw localStorage entries
- Campaign Loader still works identically — auth is checked before saving to DB

### New: API ↔ Client Data Flow

```
Component
  └── TanStack Query hook (useCampaignLibrary / usePlayerProgress)
        └── GET/POST /api/campaigns, /api/progress
              └── Drizzle → PostgreSQL
```

### State Migration

- `playerStore` and `progressStore` become cache mirrors of server state
- localStorage removed — TanStack Query handles caching and optimistic updates
- Zustand remains for in-session game state (active stage, current score, active campaign)
- On first login: localStorage campaigns optionally migrated to DB via `db/seed.ts` migration helper

### New Schemas

```
campaigns
  id, player_id, name, topic, difficulty,
  world_json (JSONB), knowledge_json (JSONB),
  created_at, last_played_at, share_token

campaign_progress
  id, player_id, campaign_id, stage_id,
  status (locked | available | completed | mastered),
  score, completed_at

quest_completions
  id, player_id, campaign_id, stage_id, quest_id,
  score, hints_used, time_to_complete_ms, completed_at

players
  id, user_id, display_name, avatar_key, xp, level, created_at
```

---

## Campaign Library System

### Saving a Campaign

When a user loads and validates a JSON pair:
1. If authenticated: `POST /api/campaigns` saves the full JSONB + metadata to DB
2. Campaign appears in the library immediately (optimistic update via TanStack Query)
3. Progress is tracked per `campaign_id` — same campaign can be replayed from scratch or continued

### Campaign Sharing

- `POST /api/campaigns/[id]/share` generates a unique `share_token`
- Shareable URL: `/load?share=[token]`
- Recipient visits the link → JSON config is fetched and pre-populated in the Campaign Loader
- Recipient must validate and explicitly click "Load Campaign" — no auto-execute

### Campaign Metadata

Pulled from `knowledge.json` root fields (defined in schema):
- `name` — display title
- `topic` — subject area tag
- `difficulty` — beginner / intermediate / advanced
- `estimatedHours` — shown on campaign card

---

## Risks

| Risk | Mitigation |
|---|---|
| localStorage → DB migration | `db/seed.ts` helper imports local campaigns on first cloud login; user prompted once |
| JSONB size limits | Enforce max JSON size (250 KB) at validation step in Campaign Loader |
| TanStack Query stale data | Define proper `staleTime` and `gcTime` per query; invalidate on campaign save |
| Share link abuse | Rate-limit share token generation; tokens are read-only, never execute server-side |
| Auth complexity | Better Auth handles sessions — minimal custom code; OAuth only added in Phase 2 |

---

## Scalability Notes

- Campaign library scales to N campaigns per player without schema changes — pagination via cursor
- JSONB storage means no schema migration needed when world/knowledge JSON structure evolves
- Share token system is stateless — tokens stored in DB, no session required to load a shared campaign
- World unlock system uses generic prerequisite config in `world.json` — no hard-coded campaign logic
- Drizzle schema versioned via migrations — safe to evolve without data loss

---

## Testing Strategy

- Integration: all API routes tested against real test DB
- Unit: Drizzle query helpers, share token generation
- E2E: full journey — register → load campaign → complete stage → library shows progress → share link flow
- Auth edge cases: expired session, concurrent logins, OAuth callback errors

---

## Migration Notes (to Phase 3)

- Auth tokens and session cookies remain unchanged
- Campaign Loader UI unchanged — AI template generation wraps around it in Phase 3
- `campaigns` table unchanged — `ai_interactions` table added in Phase 3
- No schema changes needed for Phase 3 AI adapter integration
