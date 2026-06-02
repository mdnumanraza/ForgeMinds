# Database Design

> Complete PostgreSQL schema design using Drizzle ORM.

---

## Design Principles

- Tables are normalized (3NF minimum)
- All primary keys are UUIDs (not auto-increment integers)
- Timestamps: `created_at` on all tables; `updated_at` on mutable tables
- Soft deletes via `deleted_at` where applicable
- JSON/JSONB only for truly dynamic data (not for structured fields)
- All foreign keys are explicit with `onDelete` behavior defined

---

## Schema Overview

`campaigns` is the central entity. A campaign is a validated combination of a user-supplied (or template) `world.json` and `knowledge.json`. All progress is scoped to a campaign.

```
users (Better Auth managed)
  └── players (1:1 with users)
        ├── campaigns (1:N)             ← primary domain entity
        │     ├── campaign_progress (1:N per player)
        │     └── stage_progress (1:N per player)
        ├── quest_completions (1:N)
        └── player_achievements (N:M with achievements)

achievements (seeded reference table)
campaign_templates (seeded reference table)
```

---

## Tables

### `users`
Managed by Better Auth. Do not modify.
```
id              uuid PK
email           text UNIQUE NOT NULL
name            text
email_verified  boolean
image           text
created_at      timestamp
updated_at      timestamp
```

### `players`
```
id              uuid PK DEFAULT gen_random_uuid()
user_id         uuid FK → users.id ON DELETE CASCADE UNIQUE
username        text UNIQUE NOT NULL
avatar_key      text DEFAULT 'hero-1'
xp              integer DEFAULT 0 NOT NULL
level           integer DEFAULT 1 NOT NULL
streak_days     integer DEFAULT 0
last_active_at  timestamp
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

### `campaigns`
Stores user-uploaded (or template-sourced) campaign configs as validated JSONB. This is the primary domain table.
```
id              uuid PK DEFAULT gen_random_uuid()
player_id       uuid FK → players.id ON DELETE CASCADE
name            text NOT NULL
world_config    jsonb NOT NULL          ← validated world.json content
knowledge_config jsonb NOT NULL         ← validated knowledge.json content
schema_version  text NOT NULL DEFAULT 'v1'
stage_count     integer NOT NULL        ← denormalised for quick display
topic           text                    ← extracted from knowledge.json.topic
difficulty      text                    ← extracted from knowledge.json.difficultyLevel
is_public       boolean DEFAULT false   ← Phase 2+: shareable campaigns
share_token     text UNIQUE             ← Phase 2+: UUID for share link
last_played_at  timestamp
deleted_at      timestamp               ← soft delete
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()

INDEX (player_id, last_played_at)       ← hub "recently played" query
INDEX (share_token) WHERE share_token IS NOT NULL  ← share link lookup
```

### `campaign_progress`
One row per player per campaign. Tracks overall campaign status.
```
id              uuid PK
player_id       uuid FK → players.id ON DELETE CASCADE
campaign_id     uuid FK → campaigns.id ON DELETE CASCADE
status          text DEFAULT 'active'   ← 'active' | 'completed'
completed_at    timestamp
created_at      timestamp DEFAULT now()

UNIQUE (player_id, campaign_id)
```

### `stage_progress`
```
id              uuid PK
player_id       uuid FK → players.id ON DELETE CASCADE
campaign_id     uuid FK → campaigns.id ON DELETE CASCADE
stage_id        text NOT NULL           ← matches stage id in world.json
status          text DEFAULT 'locked'   ← 'locked' | 'available' | 'completed' | 'mastered'
best_score      integer                 ← 0-100
times_played    integer DEFAULT 0
mastery_stars   integer DEFAULT 0       ← 0-3
completed_at    timestamp
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()

UNIQUE (player_id, campaign_id, stage_id)
INDEX (player_id, campaign_id)          ← hot query path: world map load
```

### `quest_completions`
```
id              uuid PK
player_id       uuid FK → players.id ON DELETE CASCADE
campaign_id     uuid FK → campaigns.id ON DELETE CASCADE
stage_id        text NOT NULL
quest_id        text NOT NULL
score           integer NOT NULL
challenge_attempts integer DEFAULT 1
hints_used      integer DEFAULT 0
time_ms         integer
xp_earned       integer NOT NULL
created_at      timestamp DEFAULT now()

INDEX (player_id, campaign_id, stage_id)
```

### `achievements`
Reference table — seeded, not player-specific.
```
id              text PK              ← e.g., 'first-stage-no-hints'
name            text NOT NULL
description     text
badge_key       text                 ← sprite asset key
xp_reward       integer DEFAULT 0
trigger_type    text                 ← 'stage_complete' | 'streak' | ...
trigger_config  jsonb                ← conditions (flexible)
created_at      timestamp DEFAULT now()
```

### `player_achievements`
```
id              uuid PK
player_id       uuid FK → players.id ON DELETE CASCADE
achievement_id  text FK → achievements.id
unlocked_at     timestamp DEFAULT now()

UNIQUE (player_id, achievement_id)
```

### `campaign_templates`
Seeded reference data. Templates are pre-validated campaigns that any player can load into the Campaign Loader. They are never directly modified by players — a player's load creates a new `campaigns` row from the template content.
```
id              text PK                 ← e.g., 'template-kubernetes-basics'
name            text NOT NULL
topic           text NOT NULL
difficulty      text NOT NULL
world_config    jsonb NOT NULL
knowledge_config jsonb NOT NULL
preview_image   text                    ← asset key
is_featured     boolean DEFAULT false
created_at      timestamp DEFAULT now()
```

> **Phase 3+:** `ai_interactions` table will be added in Phase 3 when the AI adapter is wired in. It is not part of the Phase 1 or Phase 2 schema.

---

## Drizzle Schema Example

```typescript
// src/db/schema/campaigns.ts
import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { players } from './players'

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  worldConfig: jsonb('world_config').notNull(),
  knowledgeConfig: jsonb('knowledge_config').notNull(),
  schemaVersion: text('schema_version').notNull().default('v1'),
  stageCount: integer('stage_count').notNull(),
  topic: text('topic'),
  difficulty: text('difficulty'),
  isPublic: boolean('is_public').default(false),
  shareToken: text('share_token').unique(),
  lastPlayedAt: timestamp('last_played_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  playerLastPlayedIdx: index('campaigns_player_last_played_idx').on(table.playerId, table.lastPlayedAt),
  shareTokenIdx: index('campaigns_share_token_idx').on(table.shareToken),
}))
```

```typescript
// src/db/schema/players.ts
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  avatarKey: text('avatar_key').default('hero-1'),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  streakDays: integer('streak_days').default(0),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

---

## Migrations

All migrations are managed by `drizzle-kit`:
```
npx drizzle-kit generate   ← generates SQL migration file
npx drizzle-kit migrate    ← applies pending migrations
npx drizzle-kit studio     ← visual DB browser
```

Migration files live in `src/db/migrations/` and are committed to version control.

---

## Indexes Strategy

| Table | Index | Reason |
|---|---|---|
| `campaigns` | `(player_id, last_played_at)` | Campaign Hub "recently played" query |
| `campaigns` | `(share_token) WHERE share_token IS NOT NULL` | Share link lookup |
| `campaign_progress` | `(player_id, campaign_id)` | Unique constraint + status lookup |
| `stage_progress` | `(player_id, campaign_id)` | World map load queries |
| `stage_progress` | `(player_id, campaign_id, stage_id)` | Stage status lookups |
| `quest_completions` | `(player_id, campaign_id, stage_id)` | History fetches |
