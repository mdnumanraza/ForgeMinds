# Phase 3.3 — Content Loading Pipeline

> **Phase:** 3.3 — Content Loading Pipeline
> **Purpose:** Define the complete pipeline from authored YAML files to an executable `CompiledCampaign` object consumed by the game runtime, Blueprint Viewer, and future systems.
> **Status:** v1 — conceptual only. No implementation code, no TypeScript interfaces, no database schemas.
> **Owned by:** AI
> **Inputs:** D-19 (YAML), D-22 (Hybrid loading), D-24A/B/C (engine architecture), D-26 (Campaign model never enters Phaser), `ai-content-authoring-architecture.md` (E3 file structure), `ai-theme-variant-architecture.md`, `ai-phase-02-04-knowledge-challenge-model.md` (D-18 Concept Pool)

---

## 1. Pipeline Overview

### The primary question

A content author creates four files:

```
campaigns/kubernetes-kingdom/
├── campaign.yaml
├── cast/lyra.yaml
├── stages/stage-01-hollow-fields.yaml
└── concepts/kubernetes/pod.yaml   ← contains challenge pool
```

**What happens next?**

These raw files pass through seven pipeline stages before any system can use them:

```
Raw YAML Files
    │
    ▼ Stage 1: Content Discovery
Registered file manifest
    │
    ▼ Stage 2: Validation
Validated raw objects (schema + rule checks)
    │
    ▼ Stage 3: Reference Resolution
Resolved object graph (all IDs replaced with objects)
    │
    ▼ Stage 4: Challenge Pool Resolution
Materialised challenges (enemies + bosses have concrete challenge lists)
    │
    ▼ Stage 5: Theme Resolution
Themed content objects (ThemeOverrides merged; invariant core verified intact)
    │
    ▼ Stage 6: Campaign Compilation
CompiledCampaign object (single, immutable, fully resolved)
    │
    ▼ Stage 7: Runtime Consumption
BeatController (game runtime) + Blueprint Viewer + Future systems
```

Each stage has a clear input contract, transformation, and output contract. A failure at any stage produces an error that is specific to that stage.

### Two execution environments (D-22)

The pipeline runs in two modes:

| | Development | Production |
|---|---|---|
| **YAML source** | Files on disk (watched) | Build artifact |
| **Stage 1–5** | Run at content load time (in-browser, async) | Run at build time (Node.js, synchronous) |
| **Stage 6 output** | In-memory `CompiledCampaign` | TypeScript module (statically importable) |
| **Hot-reload** | Stage 1–6 re-run on file change | N/A (rebuild required) |
| **Validation errors** | Surface in browser console + Blueprint Viewer | Block the build (non-zero exit code) |
| **Parser** | `js-yaml` (runtime) | `js-yaml` (build-time via Node.js) |

**The parity contract (from Phase 3.1):** Both environments must produce semantically identical `CompiledCampaign` objects from the same YAML input. The pipeline stages are the same logic — only the execution context differs. A parity test in CI verifies this.

---

## 2. Loading Lifecycle

### Stage 1 — Content Discovery

**Purpose:** Locate all content files for a campaign and register them as a manifest before any parsing begins.

**How campaigns are located:**
The application has a `content root` — a well-known directory (e.g., `campaigns/`) that contains one subdirectory per campaign. The discovery step enumerates subdirectories at the content root and identifies valid campaign candidates by the presence of a `campaign.yaml` file at the campaign root.

```
content root/
├── kubernetes-kingdom/    ← has campaign.yaml → candidate
├── linux-realms/          ← has campaign.yaml → candidate
└── _drafts/               ← no campaign.yaml → skipped
```

**Content manifest structure:**

For each discovered campaign, the discovery stage builds a manifest:

```
CampaignManifest {
  campaignId: string            // derived from directory name
  rootPath: string              // absolute path to campaign directory
  campaignFile: string          // path to campaign.yaml
  stageFiles: string[]          // paths to all stages/*.yaml
  castFiles: string[]           // paths to all cast/*.yaml
  questFiles: string[]          // paths to any campaign-level quests/*.yaml
  conceptFiles: string[]        // paths to platform-level concepts/
  themeFiles: Map<themeId, string[]>  // paths to theme override files
}
```

**How future campaigns fit in:** Adding a new campaign (e.g., Docker Dominion) requires only creating a `docker-dominion/campaign.yaml`. The discovery stage picks it up on the next run without any code change. Campaign registration is content, not code.

**How content packs work:** A content pack is a directory that follows the same structure as a campaign directory. The manifest discovery step can accept multiple content roots (e.g., a platform root + a community content root). Future community packs are additional content roots registered at startup.

**What discovery does NOT do:** It does not parse any YAML, validate any content, or resolve any references. It only builds the file manifest.

---

### Stage 2 — Validation

**Purpose:** Parse YAML and validate every raw object against its schema and architectural rules before any cross-file resolution begins.

Validation runs in layers — each layer is cheaper and faster than the next. Early layers block before expensive operations.

**Layer 2.1 — Parse validity**
Checks that every file is valid YAML syntax. A YAML parse error is fatal for that file — the campaign cannot load.

**Layer 2.2 — Schema validation (Zod)**
Each parsed YAML object is validated against its Zod schema. Schema defines:
- Required fields are present
- Field types are correct (string is string, array is array)
- Enum values are from the allowed set (Beat types, ChallengeTypes, lifecycle states)
- No fields violate Anti-Pattern rules (e.g., a challenge with `subjectiveAnswer: true` is rejected by schema — Anti-Pattern 7.5)

Schema errors are **fatal** — a malformed content object cannot be used.

**Layer 2.3 — Structural rules validation**
Runs the content validation rules from `src/blueprint/validation/rules.ts` (extended) against each object:
- EMPTY_STAGE: stage has at least one Beat
- MISSING_KNOWLEDGE: at least one KNOWLEDGE Beat exists
- ENCOUNTER_BEFORE_KNOWLEDGE: ordering rule BO-1
- BOSS_CONCEPT_NOT_INTRODUCED: boss concepts must appear in prior KNOWLEDGE Beats
- MISSING_PORTAL: final stage has no portal (valid); non-final stage missing portal is a warning
- LIFECYCLE_STATE: content in DRAFT or REVIEW state produces a warning and is excluded from the compiled output

Structural rule violations are **warnings by default, errors in production builds**.

**Layer 2.4 — Cross-file integrity pre-check**
Before full reference resolution, check that all referenced IDs exist in the manifest:
- Every `castMemberId` referenced in stage files exists as a cast file
- Every `conceptRef` referenced in any content exists in the concepts directory
- Every `themeId` declared in campaign.yaml has corresponding theme override files

Missing references at this layer are **fatal errors** — they would cause reference resolution to fail.

**Validation report output:**
```
ValidationReport {
  campaignId: string
  fatalErrors: ValidationError[]     // blocks all loading
  structuralErrors: ValidationError[]  // blocks production build
  warnings: ValidationWarning[]        // surfaced to author, does not block
  info: ValidationInfo[]               // advisory information
}
```

---

### Stage 3 — Reference Resolution

**Purpose:** Transform a flat collection of parsed, validated YAML objects into a connected object graph. Every ID reference is replaced with the referenced object.

**Resolution is depth-first by ownership level:**

```
1. Platform entities first (Concepts, Themes, ChallengeTypes)
   → these have no inbound references
2. Campaign entity (campaign.yaml)
   → references: Theme[], Concept[]
3. CastMember entities (cast/*.yaml)
   → references: Stage IDs (for StageAppearance mapping)
4. Stage entities (stages/*.yaml)
   → references: Concept (primary), CastMember[] (by ID), Quest (campaign-scoped)
5. Beat payloads (inline within stages)
   → references: Concept, CastMember, Quest, Reward, Item
```

**How stage references become objects:**

A stage YAML file contains:
```yaml
primaryConceptRef: "concept:kubernetes:pod"
castAppearanceTriggers:
  - castMemberId: "lyra"
    event: "beat-started"
    targetStateId: "stage-2-arrival"
```

After resolution:
```
stage.primaryConcept → Concept { id: "concept:kubernetes:pod", domain: "kubernetes", ... }
stage.appearanceTriggers[0].castMember → CastMember { id: "lyra", ... }
stage.appearanceTriggers[0].targetState → DialogueState { id: "stage-2-arrival", ... }
```

**How cast references resolve:**

CastMember files define StageAppearances — but they reference Stage IDs. The resolver builds this in two passes:
1. First pass: load all CastMember objects, register them by ID
2. Second pass: for each CastMember StageAppearance, look up the Stage by ID and link them bidirectionally

**How quest references resolve:**

Stage-scoped quests are inlined in the stage file — no reference resolution needed.

Campaign-scoped quests reference stage IDs in their step definitions. The resolver replaces stage ID references with the resolved Stage objects after all stages are loaded.

**How challenge references resolve:**

Challenge resolution is **deferred to Stage 4** (Challenge Pool Resolution). At this stage, an Enemy or BossPhase holds only a `conceptRef` + `difficultyFilter`. The actual Challenge objects are not yet materialised.

**Circular reference prevention:**

The resolver maintains a `resolutionStack` (ordered list of IDs being resolved). Before resolving an entity, the entity's ID is pushed to the stack. If the entity's ID is already on the stack when it is encountered as a reference, a circular reference error is raised.

In the ForgeMinds content model, circular references are structurally prevented by the ownership rules (D-17 hierarchy: nothing at level N can reference content also at level N in a cycle). The resolver check is a safety net.

**Missing reference handling:**

Layer 2.4 validation pre-checks all references before Stage 3 runs, so by this point all references should resolve. If a reference fails (manifest out of sync with file system), it is a **fatal error** — loading aborts for the affected campaign.

---

### Stage 4 — Challenge Pool Resolution

**Purpose:** Materialise concrete `Challenge` objects for every entity that needs them (Enemy, BossPhase, MiniChallenge), using the Concept Pool model (D-18).

**The Concept Pool model:**

Each Concept owns a `ChallengePool` containing `Challenge` objects tagged with:
- `conceptRef` — which concept this tests
- `difficulty` — INTRODUCTORY / INTERMEDIATE / ADVANCED
- `type` — MCQ / CommandCompletion / Debugging / etc.

An Enemy in a stage file declares:
```yaml
conceptRef: "concept:kubernetes:pod"
difficultyFilter: INTRODUCTORY
challengeTypePreference: [MCQ, Ordering]
```

Stage 4 resolves this to a concrete `Challenge[]` for that enemy.

**How challenge selection works:**

```
ChallengePool.query(conceptRef, difficulty, typePreferences) → Challenge[]
```

Query steps:
1. Look up the Concept Pool for `conceptRef`
2. Filter to challenges matching `difficulty` (exact match; no fallback to adjacent tiers)
3. If `typePreferences` is set, prefer challenges of those types
4. Apply the **deterministic selection strategy** (see below)
5. Return a `Challenge[]` of appropriate size for the entity

**How difficulty filtering works:**

Difficulty is exact. An INTRODUCTORY enemy never draws ADVANCED challenges. If no challenges exist at the requested difficulty, the validation report flags a `CHALLENGE_POOL_EMPTY` warning and the entity's challenge list is empty — a structural error that blocks production builds.

**Deterministic vs random challenge selection:**

During a live game session, challenge selection from a pool should feel non-repetitive (a player encountering 5 Pod Bugs should not get the same MCQ every time). However, **determinism must be preserved for:**
- Save/restore (the challenges in a saved encounter must be the same on restore)
- Development replay (reproducing a bug requires the same challenge sequence)
- Blueprint Viewer (static preview must show representative challenges)

Resolution strategy:

The pipeline does **not** apply randomness during compilation. The `CompiledCampaign` contains the full `Challenge[]` pool for each entity — all qualifying challenges, not a selection. **The game runtime selects from the pool using a seeded shuffle** (seeded with the current save slot's session seed). This keeps compilation deterministic while allowing runtime variety.

**Blueprint Viewer** receives the full pool and displays a representative sample (e.g., first 2 challenges) in the Beat Detail Panel.

**How bosses receive challenge sets:**

ActBoss and StageBoss entities declare per-phase concept requirements. For each BossPhase:
```yaml
phaseConceptRef: "concept:kubernetes:pod"
phaseConceptRef2: "concept:kubernetes:container"  # if cross-concept phase
difficultyFilter: ADVANCED
challengeCount: 3
```

Stage 4 queries the pool for each referenced concept at the specified difficulty and assembles a phase-specific `Challenge[]`.

---

### Stage 5 — Theme Resolution

**Purpose:** Apply ThemeOverrides to all theme-variant fields in the resolved object graph, producing a fully-themed content object ready for compilation. The invariant core is verified as untouched.

**Theme selection:**

The pipeline resolves for a **specific theme** — it does not produce a "multi-theme" object. The active theme is declared at pipeline invocation:
```
pipeline.compile(campaignId, themeId)
```

In development, the active theme is set by the developer (defaulting to the campaign's primary theme). In production, one compiled output is produced per supported theme.

**Override application algorithm:**

For each entity with theme-variant fields:
1. Load the entity's theme-neutral base object (from Stage 3)
2. Look up the ThemeOverride for this entity under `themeId` (from the theme override files)
3. For each field in the ThemeOverride: confirm the field is classified as Theme-Variant (not Theme-Invariant)
   - If Theme-Invariant field is touched → **fatal error** (Rule TVL-1 violation)
   - If Theme-Variant field → apply the override (patch the field on the base object)
4. Confirm all required Theme-Variant fields have overrides (Rule TVL-2)
   - Missing theme field → **warning in development**, **error in production**
5. Produce the themed entity

**What is transformed:**

All visible text fields: region names, NPC names, dialogue lines, knowledge panel framing text, enemy names, boss names, item names, ability names, stage titles, act titles. Visual and audio tags (theme-variant visual archetype identifiers).

**What remains invariant:**

All of the following are confirmed unchanged after theme application: concept references, challenge questions and correct answers, quest resolution conditions, boss phase structures, Beat types and positions, progression values, mastery check conditions. The pipeline asserts these fields match the pre-theme baseline after override application.

**How validation confirms compatibility:**

The pipeline runs Rule TVL-2 (Theme Completeness) as a post-application check: after merging overrides, scan all entities for theme-variant fields that were not overridden. In production this is fatal; in development it is a warning with specific field callouts in the validation report.

**Multi-theme compilation (production):**

The build step runs Stage 5 once per declared theme and produces one `CompiledCampaign` per theme. At game startup, the player selects a theme; the corresponding compiled file is loaded.

---

### Stage 6 — Campaign Compilation

**Purpose:** Assemble the fully resolved, validated, theme-applied object graph into a single immutable `CompiledCampaign` object.

**What the CompiledCampaign contains:**

```
CompiledCampaign {
  meta: {
    campaignId,
    campaignVersion,       ← content versioning (D-27)
    themeId,
    compiledAt,            ← timestamp
    schemaVersion,         ← pipeline schema version
  }

  campaign: {
    id, title, domain,
    progressionModel,
    acts: [
      Act {
        id, title, narrativeTheme,
        entryCondition,
        actBoss: CompiledBoss,    ← fully resolved; challenges materialised
        stages: [
          Stage {
            id, title,
            primaryConcept: Concept,    ← full object
            beats: [
              Beat {
                id, position, type,
                payload: <typed payload>,  ← fully resolved; theme applied
                appearanceTriggers: [...]
              }
            ]
          }
        ]
      }
    ]
  }

  castRoster: Map<castMemberId, CastMember>
    ← all cast members, each with all StageAppearances and DialogueStates resolved

  conceptRegistry: Map<conceptId, Concept>
    ← all concepts used in this campaign

  challengePools: Map<conceptId, Challenge[]>
    ← pre-filtered pools per concept/difficulty (ready for runtime selection)

  validationReport: ValidationReport
    ← warnings and info from all pipeline stages (not errors — those blocked compilation)
}
```

**What the CompiledCampaign does NOT contain:**
- Raw YAML strings — they are discarded after parsing
- ThemeOverride objects — they have been applied and are no longer needed
- Reference IDs — all ID references have been replaced with objects
- Player state — this is a content object, not a runtime state object
- Challenge selections — pools are included; runtime selection applies the seeded shuffle

**Who consumes it:**

| Consumer | When | How |
|---|---|---|
| BeatController (game runtime) | At game start; when campaign is selected | Reads `acts`, `stages`, `beats`, `castRoster`, `challengePools` |
| Blueprint Viewer | When a campaign is loaded for review | Reads the entire object; displays in Campaign/Stage/Beat views |
| Future Visual Editor | When editing a campaign | Reads + writes (editor produces new YAML; pipeline re-compiles) |
| Future AI Systems | When generating content | Reads existing compiled campaign as context; outputs new YAML files |

**When it is created:**
- Development: on first access after content change (lazy, triggered by file-watch)
- Production: at build time (eager, for all campaigns × all themes)

**When it is discarded:**
- Development: when source files change (invalidated and recompiled)
- Production: never (build artifacts are immutable until next build)
- Runtime: when the player exits the game or switches campaigns

---

### Stage 7 — Runtime Consumption

**Purpose:** Define how BeatController and Blueprint Viewer consume the `CompiledCampaign` without diverging from each other.

**The shared model contract:**

Both consumers receive **the same `CompiledCampaign` object** — not separate derivations of it. The pipeline produces one canonical object. The viewer and the runtime are both consumers of that object. They cannot diverge because they share the source.

```
Pipeline produces: CompiledCampaign (one canonical object)
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      BeatController          Blueprint Viewer
      (game runtime)          (React Flow)
      reads beats[]           reads beats[]
      reads castRoster        reads castRoster
      reads challengePools    reads challengePools (sample for display)
```

**How BeatController consumes it:**

On campaign selection, `BeatController` receives the `CompiledCampaign` and holds it as its content source. Beat execution reads from `campaign.acts[n].stages[m].beats` in sequence. Cast lookups use `castRoster`. Challenge pool access uses `challengePools[conceptId]` at runtime (with seeded shuffle applied in the session).

The `CompiledCampaign` is read-only from the BeatController's perspective. It never mutates content — it mutates `progressState` (Zustand) in response to content events.

**How Blueprint Viewer consumes it:**

The viewer's adapter (`src/blueprint/data/adapter.ts`) already accepts a `Campaign`-shaped object and converts it to React Flow nodes/edges. After Phase 3.8 (Blueprint Runtime Integration), the adapter will accept a `CompiledCampaign` directly — the viewer's data model is reconciled with the pipeline's output model.

In development, the viewer can load a `CompiledCampaign` live (from the YAML files on disk via the runtime pipeline). In production, it loads the pre-compiled artifact.

**How they avoid separate content models:**

The pipeline owns the canonical type. Both consumers depend on the pipeline's output type. The type is defined once (Phase 3.8 will formalise this as D-31). If the pipeline's output type changes, both consumers update at the same time — they cannot drift.

---

## 3. Validation Architecture

### Validation layers summary

| Layer | What it checks | Block level | Runs at |
|---|---|---|---|
| 2.1 Parse validity | Valid YAML syntax | Fatal | Stage 2, immediate |
| 2.2 Schema (Zod) | Required fields, types, enum values | Fatal | Stage 2, per object |
| 2.3 Structural rules | Beat ordering, concept coverage, lifecycle state | Error (prod) / Warning (dev) | Stage 2, per stage |
| 2.4 Cross-file pre-check | All referenced IDs exist in manifest | Fatal | Stage 2, post-schema |
| 5.x Theme validation | TVL-1 invariant core, TVL-2 completeness | Fatal (TVL-1) / Error (TVL-2 prod) | Stage 5 |
| 4.x Pool validation | Challenge pools non-empty at required difficulty | Error (prod) / Warning (dev) | Stage 4 |

### Author feedback model

When a validation issue is found, the feedback must identify:
1. **Which file** caused the issue (absolute path)
2. **Which field** (YAML path, e.g., `beats[3].payload.conceptRef`)
3. **What rule** was violated (rule ID: e.g., `BO-1`, `TVL-2`, `MISSING_KNOWLEDGE`)
4. **Why it matters** (human-readable explanation)
5. **How to fix it** (specific corrective action)

Example:
```
ERROR [stage-02-podveil-village.yaml]
  Rule: BO-1 (ENCOUNTER_BEFORE_KNOWLEDGE)
  Field: beats[2] (type: ENCOUNTER, position: 3)
  Issue: ENCOUNTER Beat at position 3 precedes first KNOWLEDGE Beat (position 4).
  Fix: Move the KNOWLEDGE Beat to a position before 3, or move this ENCOUNTER Beat to after position 4.
```

**Future Visual Editor feedback:** The same `ValidationReport` object is consumed by the editor — it highlights the offending Beat node in red and surfaces the same message in a sidebar panel. This is why the ValidationReport is included in `CompiledCampaign.validationReport` — not just for terminal output.

---

## 4. Reference Resolution Architecture

### Resolution graph

```
Platform (L0)
  Concept → no outbound references
  Theme → no outbound references
  ChallengeType → no outbound references

Campaign (L1)
  → Theme[] (platform)
  → Concept[] (platform)
  ↳ CastMember[]
      ↳ StageAppearance[]
          → Stage (by ID, resolved after stages load)
          ↳ DialogueState[]
              ↳ DialogueLine[]
  ↳ Act[]
      ↳ Stage[]
          → Concept (primary, platform)
          → CastMember[] (by ID, resolved from cast roster)
          ↳ Beat[]
              ↳ Payload (typed)
                  Quest payload → Concept (mastery check), CastMember (giver)
                  Enemy payload → Concept (conceptRef)  [challenge deferred to Stage 4]
                  Boss payload → Concept[] [challenge deferred to Stage 4]
                  KnowledgeBeat payload → Concept (conceptRef)
```

**Bidirectional links:** The resolver builds bidirectional links where needed:
- `Stage.castAppearances` → linked CastMember objects
- `CastMember.stageAppearances[n].stage` → linked Stage object

These links allow both "which stages does Lyra appear in?" (from CastMember) and "which cast members appear in Stage 2?" (from Stage) to be answered without traversal.

---

## 5. Theme Resolution Architecture

### Three-file pattern for theme overrides

Under E3, theme overrides co-locate with the content they patch:

```
campaigns/kubernetes-kingdom/
├── campaign.yaml
├── stages/
│   ├── stage-02-podveil-village.yaml        ← base content
│   └── stage-02-podveil-village.space.yaml  ← Space theme overrides for stage 02
├── cast/
│   ├── lyra.yaml                            ← base cast member
│   └── lyra.space.yaml                      ← Space theme overrides for Lyra
└── themes/
    └── space-galaxy.yaml                    ← theme metadata (id, label, visual palette tag)
```

The `*.space.yaml` files contain only the override fields — not a full copy of the entity. The resolver merges them.

**Alternate organisation:** For campaigns with many themes, theme overrides can be grouped into a theme directory:

```
themes/space-galaxy/
├── stages/stage-02-override.yaml
├── cast/lyra-override.yaml
└── ...
```

Both are valid under E3. The discovery stage handles both layouts.

---

## 6. Challenge Resolution Architecture

### Pool query model

```
challengePools[conceptId][difficulty] → Challenge[]
```

The pipeline pre-builds this lookup structure in Stage 4. At runtime, the BeatController queries:
```
challengePools["concept:kubernetes:pod"]["INTRODUCTORY"]
→ [Challenge, Challenge, Challenge, ...]   (full pool, pre-filtered)
```

The game runtime applies a **seeded shuffle** to this pool using the session seed (stored in `progressState`). The shuffle is deterministic per seed — the same session always produces the same challenge sequence for the same enemy encounter. Death and retry produce the same sequence unless the session seed is reset (which happens only when starting a new campaign).

**Why pre-filter in the pipeline, not at runtime:**

Pre-filtering in Stage 4 means the runtime never has to know about concept IDs or difficulty enums — it just reads an array. This enforces D-26 (Campaign model never enters Phaser) at the data level: Phaser only receives the pre-filtered `Challenge[]` as part of the `SPAWN_ENEMY` or `START_BOSS_SEQUENCE` command payload.

---

## 7. Compiled Campaign Object

*Defined in Stage 6 above. Key properties summarised:*

| Property | What it is | Who uses it |
|---|---|---|
| `meta.campaignVersion` | Content version string (D-27) | Save system, compatibility checks |
| `campaign.acts[].stages[].beats[]` | Fully resolved Beat sequence per Stage | BeatController |
| `castRoster` | All CastMembers with resolved StageAppearances | BeatController, Blueprint Viewer |
| `conceptRegistry` | All Concepts used in this campaign | BeatController (mastery tracking), Blueprint Viewer |
| `challengePools` | Pre-filtered Challenge arrays per concept/difficulty | BeatController (runtime selection) |
| `validationReport` | Non-fatal warnings from all pipeline stages | Blueprint Viewer, future editor |

---

## 8. Content Versioning (D-27)

### The problem

A player saves at Stage 7, beat position 4. A content update adds a new beat at position 3 in Stage 7. When the player loads their save, beat position 4 now refers to a different beat than when they saved.

### Architecture

**Content version identifier:**

Every `CompiledCampaign` carries a `campaignVersion` — a string derived from the content's hash at compile time. The save system writes this version alongside the player's progress state.

```
SaveFile {
  campaignId: "kubernetes-kingdom"
  campaignVersion: "2.3.1"    ← version at save time
  progressState: { ... }
}
```

**Version compatibility model:**

When loading a save, the runtime compares `saveFile.campaignVersion` to the loaded `compiledCampaign.meta.campaignVersion`:

| Comparison | Result |
|---|---|
| Exact match | ✅ Load normally |
| Minor version difference | ⚠️ Load with compatibility mode (explained below) |
| Major version difference | ❌ Cannot load — save is incompatible |

**Compatibility mode (minor version):**

Minor version changes are content additions or non-breaking edits (new beats added, dialogue revised). Compatibility mode:
- Saves the player's progress by stage completion (not beat position)
- On load: player is placed at the first unvisited beat in the last incomplete stage
- A banner informs the player: "This save was made with an earlier version of the content. Some progress may be approximate."

**Major version:**

Major version changes are breaking structural changes (stages removed, concept references changed, act structure revised). Major bumps require a formal migration plan and are an exceptional event — not expected in normal development. For v1, a major version change makes the save unloadable (the player starts over or continues with an older content version).

**Version string format:**

`{majorVersion}.{minorVersion}.{contentHash[:8]}`

Example: `1.3.a4f2c91b`

The content hash is derived from a deterministic hash of all YAML file contents. This means any content change — including whitespace-only edits — produces a different hash. The major/minor version is explicitly set in `campaign.yaml` by the content author; the hash is appended automatically by the pipeline.

**How Blueprint Viewer and Runtime remain compatible:**

Both consume the same `CompiledCampaign` object, which carries the version in `meta.campaignVersion`. If the viewer and runtime are both loading from the same build artifact, they are always on the same version. In development, both load from the same in-memory pipeline output — same object, same version.

---

## 9. Error Strategy

### Fatal errors (block all loading)

| Error | Pipeline stage | Example |
|---|---|---|
| YAML parse failure | Stage 2.1 | Invalid YAML syntax in stage-02.yaml |
| Schema violation | Stage 2.2 | Required field `conceptRef` missing from KnowledgeBeat payload |
| Missing reference | Stage 2.4 | Stage references `castMemberId: "lyra"` but no lyra.yaml exists |
| Circular reference | Stage 3 | Content cycle detected in reference graph |
| Theme invariant violation | Stage 5 | ThemeOverride attempts to change a challenge's correct answer |

Fatal errors abort pipeline for the affected campaign. Other campaigns are unaffected. In development, a fatal error surfaces in the browser console with full path + field + fix guidance. In production, the build fails with a non-zero exit code.

### Recoverable errors (block production build, warning in dev)

| Error | Pipeline stage | Example |
|---|---|---|
| Structural rule violation | Stage 2.3 | ENCOUNTER Beat appears before KNOWLEDGE Beat |
| Challenge pool empty | Stage 4 | No INTERMEDIATE challenges exist for `concept:kubernetes:ingress` |
| Theme completeness failure | Stage 5 | Stage 10's Space theme override is missing enemy name translations |
| DRAFT/REVIEW content included | Stage 2.3 | Stage 7 has lifecycle state REVIEW (not PLAYABLE) |

Recoverable errors allow the development pipeline to continue (the author can still see their content in the Blueprint Viewer). They block the production build — no unvalidated content reaches players.

### Warnings (never block)

| Warning | Example |
|---|---|
| Missing ARRIVAL Beat | Stage has no ARRIVAL Beat — not forbidden, but unusual |
| Low challenge pool density | Concept pool has fewer than 5 challenges at a difficulty tier |
| Deprecated content referenced | An entity references a deprecated Concept |
| Optional stage not in registry | Stage file exists but is not registered in campaign.yaml optional stage registry |

Warnings appear in the `CompiledCampaign.validationReport` and are surfaced by the Blueprint Viewer.

---

## 10. Future Scalability Analysis

### Additional campaigns

The pipeline's campaign-per-directory model scales linearly. Adding Linux Realms creates a new directory under `campaigns/`. The pipeline discovers and processes it independently. No pipeline code changes. Maximum scalability.

### Additional themes

Adding a Space Galaxy theme creates theme override files co-located with existing content (or in a `themes/space-galaxy/` directory). Stage 5 picks them up automatically. The pipeline runs once per theme. Additive — no changes to existing content or pipeline code.

### AI-generated campaigns

An AI system generates YAML files that conform to the E3 structure and content schemas. These YAML files are placed in `campaigns/ai-generated-name/`. The pipeline treats them identically to human-authored content. The Zod schema and structural rules are the AI content's quality gate — no special AI pipeline needed. The lifecycle model (D-CA-LC-1) ensures AI content requires human REVIEW before it becomes PLAYABLE.

### Visual Content Editor

The editor reads from `CompiledCampaign` (for display) and writes to YAML source files (for persistence). The pipeline re-compiles when files change. The editor is a consumer of the pipeline, not a replacement for it. Phase 3.8 will formalise the editor's relationship to the pipeline via the Blueprint Runtime Integration architecture.

### Campaign Marketplace

A marketplace content pack is a directory following the same structure as any campaign. The discovery stage accepts additional content roots. A marketplace pack registered as a content root is processed by the identical pipeline. The PLAYABLE lifecycle gate ensures marketplace content has been reviewed before it reaches players.

### Community content packs

Same as marketplace — a directory, a content root, the identical pipeline. Community packs can declare their own Concepts and Themes, or reference platform-level ones. The pipeline's reference resolver handles cross-pack concept references as long as both packs are registered in the content root.

---

## Top 5 Future Risks

**RISK-01 — Dev/prod pipeline parity drift (High likelihood without a parity test)**
The two-environment design (D-22) creates risk of semantic divergence between in-browser parsing and build-time compilation. A field that YAML parses differently in `js-yaml` vs the build step's parser would produce different `CompiledCampaign` objects in dev vs prod, leading to bugs that only appear in production.
*Mitigation already designed:* Phase 3.1 established a required parity test in CI. This risk is managed by executing it.

**RISK-02 — Challenge pool starvation (Medium)**
If a Concept's pool has too few challenges at a required difficulty, the same challenges repeat frequently — breaking the "competence, not luck" feel. The pipeline warns but cannot prevent this in all cases.
*Mitigation:* D-CA-16 establishes a minimum of 15 challenges per concept/difficulty tier. Enforce via a structural rule in Stage 4 validation. Alert the content author early.

**RISK-03 — Major version save incompatibility at scale (Medium)**
As campaigns grow and evolve, major version bumps that break saves will frustrate players. The current architecture provides no migration path — players start over.
*Mitigation:* The architecture is designed to make major bumps rare (only structural breaks). A migration system (deferred) should be designed before any campaign exits v1 scope. This risk is known and accepted for v1.

**RISK-04 — Theme completeness debt (Low-Medium)**
If a campaign ships with one theme and adds a second later, the completeness gap (all the Stage/NPC/dialogue overrides that must be written) can be underestimated. TVL-2 catches it at build time, but only after the authoring debt has accumulated.
*Mitigation:* The pipeline's `ValidationReport` surfaced in the Blueprint Viewer should show theme completion percentage progressively — not just at build time. This gives content authors continuous visibility into the gap.

**RISK-05 — Reference resolution performance at large campaign scale (Low for v1)**
A campaign with 50 stages, 200 cast appearances, and 5000 challenge pool entries could have a slow reference resolution pass in development hot-reload. For Kubernetes Kingdom (14 stages), this is a non-issue. For a 50-stage campaign, this may become noticeable.
*Mitigation:* Stage 3 resolution can be made incremental (only re-resolve changed files). For v1 scope, full re-resolution is acceptable.

---

## Top 5 Future Opportunities

**OPP-01 — AI-generated challenge pools**
The Concept Pool structure (Stage 4) is perfectly suited for AI generation. An AI system given a Concept definition can generate INTRODUCTORY/INTERMEDIATE/ADVANCED challenges that conform to the Zod schema. The pipeline's validation ensures quality before PLAYABLE state. This makes challenge bank growth essentially unbounded.

**OPP-02 — Pipeline-driven campaign analytics**
The `CompiledCampaign.validationReport` already contains structural intelligence about each campaign (density gaps, theme coverage, concept prerequisites). A future analytics dashboard could aggregate reports across all campaigns and surface systemic content quality patterns — without any new pipeline work.

**OPP-03 — Incremental compilation for large campaigns**
The pipeline currently recompiles an entire campaign on any file change. Stage 3's dependency graph (which files reference which) already exists. A future optimisation: only re-run Stage 3–6 for the files that changed and their dependents. Particularly valuable for large multi-stage campaigns.

**OPP-04 — Community content quality gates**
The pipeline's validation architecture — Zod schema + structural rules + challenge pool density + theme completeness — can be offered as a self-service tool to community content creators. Submit your YAML, run the pipeline, get a validation report before submission. This scales content quality without human review of every contribution.

**OPP-05 — Cross-campaign concept progression**
The `conceptRegistry` in `CompiledCampaign` knows which Concepts a campaign uses. A future "Learning Path" feature could query concept registries across campaigns to identify which campaigns teach prerequisites for a target concept — enabling cross-campaign learning recommendations without coupling campaigns to each other.

---

## Recommended inputs for Phase 3.4 (State Management)

Phase 3.4 will design runtime state management. The following outputs from Phase 3.3 are its primary inputs:

1. **`CompiledCampaign` object structure** — defines what state the runtime reads from content (beats, cast roster, challenge pools) vs what it generates itself (mastery, quest state, HP)
2. **Challenge pool seeded shuffle model** — the session seed is a piece of state that Phase 3.4 must accommodate in `progressState`
3. **Lifecycle state gate (PLAYABLE only)** — Phase 3.4's state model must include the content lifecycle as a precondition for any game state: a player cannot have progress in a non-PLAYABLE stage
4. **Content versioning (D-27)** — Phase 3.4's `progressState` must include `campaignVersion` alongside progress data for the save system to use in Phase 3.5

---

## Decisions established in Phase 3.3

| Decision | Resolution | Status |
|---|---|---|
| D-27 | Content versioning: `{major}.{minor}.{contentHash[:8]}`; exact match loads normally; minor version → compatibility mode; major version → incompatible. | Established here — record in DECISIONS.md |
| D-28 (pipeline stages) | Seven-stage pipeline: Discovery → Validation → Reference Resolution → Challenge Pool Resolution → Theme Resolution → Compilation → Consumption | Established here |

---

## Cross-references

- `milestones/milestone-03-technical-architecture/ai-engine-architecture.md` — Beat execution model that consumes the CompiledCampaign
- `milestones/milestone-03-technical-architecture/ai-tech-evaluation.md` — D-22 Hybrid loading strategy implemented here
- `content-architecture/ai-content-authoring-architecture.md` — E3 file structure this pipeline reads
- `content-architecture/ai-theme-variant-architecture.md` — Theme rules enforced in Stage 5
- `content-architecture/ai-phase-02-04-knowledge-challenge-model.md` — D-18 Concept Pool resolved in Stage 4
- `content-architecture/ai-authoring-lifecycle.md` — PLAYABLE lifecycle gate enforced in Stage 2.3
- `src/blueprint/data/types.ts` — current Campaign type that will be reconciled with CompiledCampaign in Phase 3.8
- `DECISIONS.md` — D-27 and D-28 to be recorded
