# ForgeMinds — Theme Variant Architecture

> **Phase:** 2.7 — Theme Variant Architecture
> **Purpose:** Define how visual themes (Fantasy Kingdom, Space Galaxy, future themes) are applied to ForgeMinds content — what changes, what never changes, and how the system supports N themes without forking content.
> **Status:** v1 — conceptual only. Not about assets, environments, or visual design. About content architecture.
> **Owned by:** AI
> **Cites:** `ai-vision.md §6 Tier C`, `ai-phase-02-01-content-hierarchy.md`, `ai-beat-model.md`

---

## The foundational constraint

From `ai-vision.md §6 Tier C`:

> "A Kubernetes Kingdom stage played in Fantasy theme and in Space theme must produce the same emotional beats at the same moments."

This is not a preference. It is the architectural invariant that every theme decision derives from. If a theme change alters *when* a comprehension click fires, *which* quest is available, or *how* a boss validates mastery — the theme system has failed.

**Themes are a surface. The learning experience is the structure. The surface can change. The structure cannot.**

---

## Section 1 — Classification of every content entity

For each entity, fields are classified as:

- **Theme-Invariant (TI):** Must be identical across all themes. Changing it changes the gameplay or learning.
- **Theme-Variant (TV):** Must have a theme-specific version in each supported theme. The base (theme-neutral) version provides the default.
- **Theme-Optional (TO):** May have a theme-specific version, but a fallback to the base is acceptable.
- **Theme-Derived (TD):** No explicit authoring needed — automatically derived from the active theme (e.g., visual palette, ambient audio category).

---

### Campaign

| Field category | Classification | Why |
|---|---|---|
| Domain (Kubernetes, Linux) | TI | Domain defines what the player learns. Never changes. |
| Concept references | TI | Which concepts the campaign teaches. Invariant. |
| Act structure and stage list | TI | The campaign's progression shape. Invariant. |
| Cast roster (IDs) | TI | Which characters exist in the campaign. The characters' names may vary (TV), but the roster does not. |
| Progression model (XP thresholds, levels) | TI | Mechanics are invariant. |
| Campaign title | TV | "Kubernetes Kingdom" (Fantasy) → "Kubernetes Cluster" or "Kubernetes Galaxy" (Space) |
| World name / lore framing | TV | "The Kingdom" → "The Cluster" or "The Station" |
| Theme references | TI | Which themes this campaign supports — part of the campaign's definition |

---

### Act

| Field category | Classification | Why |
|---|---|---|
| Stage ordering and IDs | TI | The structural backbone of the act |
| Narrative theme label (Discovery, Responsibility, Mastery) | TI | The learning arc phase. Invariant. |
| Act entry condition | TI | Gameplay gate. Never changes between themes. |
| Act Boss reference | TI | Which boss validates the act. Invariant. |
| Act title | TV | "Act 1 — Fundamentals" (Fantasy) → "Sector 1 — Core Systems" (Space) |
| Act narrative summary | TV | The prose description of the act's story framing |

---

### Stage

| Field category | Classification | Why |
|---|---|---|
| Primary concept reference | TI | What the stage teaches. Invariant. |
| Beat sequence (type, position, payload type) | TI | The structural gameplay arc. Invariant. |
| Level range | TI | Difficulty guidance. Invariant. |
| Knowledge density target | TI | How many knowledge beats. Invariant. |
| Stage title | TV | "The Hollow Fields" (Fantasy) → "The Abandoned Sector" (Space) |
| Story purpose description | TV | The narrative framing of the stage's wound |
| Region name | TV | "The Hollow Fields" → "Derelict Processing Zone" |
| Theme-visual tag | TD | Which visual template to use — derived from the theme + stage type |

---

### Beat

| Field category | Classification | Why |
|---|---|---|
| Beat type | TI | KNOWLEDGE, ENCOUNTER, BOSS, etc. Invariant. |
| Beat position | TI | Where in the sequence. Invariant. |
| Payload type | TI | What the beat carries. Invariant. |
| AppearanceTrigger target states | TI | Which dialogue states activate. Invariant. |
| Beat has no directly visible text | — | Beats are structural. Their payload carries the theme-variant text. |

**Beats themselves are fully theme-invariant.** Theme variation lives in the payload content, not the Beat envelope.

---

### KnowledgeBeat / KnowledgePanel

| Field category | Classification | Why |
|---|---|---|
| Concept reference | TI | What concept is being taught. Non-negotiable. |
| Technical content (definition, example, command) | TI | The actual learning material. Never changes. |
| Gameplay channel | TI | Which channel delivers the beat. Invariant. |
| Panel title (discovery object name) | TV | "Ancient Scroll" (Fantasy) → "Data Tablet" (Space) |
| Panel body framing | TV | The narrative wrapper: "A long-forgotten scroll reveals..." → "A recovered data packet contains..." |
| Analogy text | TV | The real-world analogy may be reframed in theme language |
| Delivery object name | TV | "glowing scroll" → "holographic interface" |

**Rule TV-1:** The technical definition, examples, and commands inside a KnowledgePanel are always Theme-Invariant. A theme override may change the framing sentence; it may never change the technical content.

---

### Quest

| Field category | Classification | Why |
|---|---|---|
| Quest scope (stage / campaign) | TI | Structural. Invariant. |
| Resolution conditions (concept mastery check) | TI | The gameplay requirement. Invariant. |
| Reward type and value | TI | XP, item grants. Invariant. |
| Quest steps (structure) | TI | The sequence of objectives. Invariant. |
| Quest title | TV | "Identify the Intact Containers" → "Audit the Viable Modules" |
| Quest description / narrative context | TV | The story framing of the quest |
| Quest step descriptions | TV | The in-world description of each step |
| NPC giver name | TV | Derived from the NPC's theme-variant name |

---

### NPC (Local)

| Field category | Classification | Why |
|---|---|---|
| Role in stage | TI | Quest-giver, knowledge-keeper — invariant |
| Quest hook references | TI | Which quests this NPC is tied to. Invariant. |
| Dialogue state structure (pre/mid/post-quest) | TI | Which states exist. Invariant. |
| NPC name | TV | "Bram the Field Warden" → "Module Technician Bram" |
| NPC occupation title | TV | "Field Warden" → "Systems Monitor" |
| Dialogue line text | TV | All visible dialogue changes between themes |
| Visual archetype tag | TD | Derived from theme + NPC role |

---

### CastMember

| Field category | Classification | Why |
|---|---|---|
| Role in campaign | TI | Lyra is always the knowledge-keeper. Invariant. |
| Arc trajectory | TI | Her growth from confident to humble is invariant |
| Stage appearance list | TI | Which stages she appears in. Invariant. |
| AppearanceTrigger conditions | TI | What events activate her dialogue states. Invariant. |
| Dialogue state structure | TI | Which states exist per stage appearance. Invariant. |
| Character name | TO | "Lyra" may stay or be renamed ("Lyra-7", "Archive-Keeper Lyra") |
| Dialogue line text | TV | All spoken lines change between themes |
| Visual descriptor | TV | "the last archivist" → "the last data keeper" |
| Visual archetype tag | TD | Derived from theme |

**Rule TV-2:** CastMember arcs are Theme-Invariant. A CastMember's personality, growth beats, and arc shape must be expressible in every supported theme. A theme author gives them a name and a voice — they do not change who the character is.

---

### Enemy

| Field category | Classification | Why |
|---|---|---|
| Concept reference (what failure mode this represents) | TI | The educational meaning of the enemy. Invariant. |
| Encounter trigger type | TI | How the encounter starts. Invariant. |
| Challenge references | TI | What challenges this enemy uses. Invariant. |
| Enemy name | TV | "Shell Beetles" → "Corrupted Modules" |
| Enemy description | TV | Visual and narrative description |
| Visual archetype tag | TD | Derived from theme + concept |

---

### Boss

| Field category | Classification | Why |
|---|---|---|
| Concept requirements | TI | Which concepts the boss validates. Non-negotiable. |
| Phase structure (count, sequence) | TI | How many phases and in what order. Invariant. |
| Per-phase concept reference | TI | What each phase tests. Invariant. |
| Resolution condition type | TI | DAMAGE_HP_ZERO, CORRECT_ANSWER_PRESENTED, etc. Invariant. |
| Phase exposure mechanism | TI | The causal chain between phases. Invariant. |
| Boss name | TV | "The Hollow Sovereign" → "The Null Overseer" |
| Boss narrative role description | TV | The in-world framing of the boss |
| Visual archetype tag | TD | Derived from theme + boss tier |

**Rule TV-3:** Boss phase mechanics are fully Theme-Invariant. A theme author gives the boss a name and a visual archetype. They do not change how many phases it has or what each phase tests.

---

### DialogueState / DialogueLine

| Field category | Classification | Why |
|---|---|---|
| State name (pre-quest, mid-quest, post-quest, etc.) | TI | Which state it is. Invariant. |
| State activation condition | TI | What triggers this state. Invariant. |
| State priority | TI | Which state wins when multiple are active. Invariant. |
| Dialogue text | TV | Every spoken or shown word changes between themes |
| Tone / emotional register markers | TO | Optional hint for voice direction |

**Rule TV-4:** DialogueState structure is Theme-Invariant. DialogueLine text is Theme-Variant. A theme author rewrites every line — they do not add or remove states.

---

### Reward

| Field category | Classification | Why |
|---|---|---|
| Reward type (XP, item, ability, story flag) | TI | What category of reward. Invariant. |
| Reward value (XP amount, item ID) | TI | The mechanical value. Invariant. |
| Reward description / narrative framing | TV | How the reward is presented in the world |

---

### ProgressionLevel / Item / Ability

| Field category | Classification | Why |
|---|---|---|
| Level thresholds and XP values | TI | Mechanics. Invariant. |
| Ability mechanics (charge rate, effect) | TI | Gameplay effect. Invariant. |
| Item mechanical effect | TI | What it does. Invariant. |
| Level titles / names | TV | "Apprentice Cluster Mender" vs "Level 3 Technician" |
| Item name | TV | "Crystal Shard" → "Datacore Fragment" |
| Ability name | TV | "Sword Strike" → "System Override" |
| Item description | TV | Narrative flavour text |

---

### Region

| Field category | Classification | Why |
|---|---|---|
| Region type category (village, ruins, fortress) | TI | The structural type affects traversal and pacing. Invariant. |
| ExplorationPoint count and structure | TI | How many things are worth approaching. Invariant. |
| Region name | TV | "The Hollow Fields" → "Derelict Processing Zone" |
| Environmental description | TV | All visible descriptive text |
| EnvironmentalStory text | TV | The lore detail in the environment |
| Visual template tag | TD | Derived from theme + region category |

---

### Portal

| Field category | Classification | Why |
|---|---|---|
| Next stage reference | TI | Where the portal leads. Invariant. |
| Unlock condition | TI | What must be true to cross. Invariant. |
| Portal narrative description | TV | The story beat that accompanies crossing |
| Visual tag | TD | Derived from theme |

---

## Section 2 — Theme architecture rules

### Theme Ownership Rules

**Rule TO-1:** Themes are owned at the Platform level (L0). No single campaign owns a Theme definition. Any campaign can reference any Platform-level Theme.

**Rule TO-2:** A ThemeOverride is owned by the entity it patches. The Stage file owns its Stage-level ThemeOverrides. The Cast file owns its CastMember ThemeOverrides. ThemeOverrides do not exist as standalone files — they live alongside the content they modify.

**Rule TO-3:** Creating a new Theme requires Platform-level authority. A content author creates ThemeOverride objects for existing content; only a platform architect creates a new Theme definition.

**Rule TO-4:** A campaign declares which Themes it supports. Declaring a Theme creates an authoring obligation: all Theme-Variant fields in all of the campaign's content must have a ThemeOverride for that Theme. Validation enforces completeness.

---

### Theme Boundaries

**Rule TB-1: The Invariant Core is inviolable.** A ThemeOverride may only patch fields classified as Theme-Variant or Theme-Optional. Any attempt to patch a Theme-Invariant field (concept references, challenge answers, quest resolution conditions, beat types, boss phase structure, progression values) is a validation error, not a warning.

**Rule TB-2: Themes cannot change gameplay pacing.** The number of beats, their types, and their sequence are Theme-Invariant. A Space theme cannot add a beat or remove a beat from Stage 2. It can only rename, redescribe, and retag what is already there.

**Rule TB-3: Themes cannot change learning scope.** A theme override cannot change which concept a KnowledgeBeat introduces, which concept an enemy represents, or which concepts a boss requires. These are educationally critical and protected at the architecture level.

**Rule TB-4: Themes provide complete coverage or none.** A ThemeOverride set for a campaign is either complete (all TV fields covered) or absent. A partial theme (covering some stages but not others) is a validation error — it would produce a mixed-theme experience that is unintended and disorienting.

---

### Theme Validation Rules

**Rule TVL-1: Invariant Core Integrity.** Run on every content save. Checks that no ThemeOverride patches a Theme-Invariant field. Severity: error (blocks APPROVED state).

**Rule TVL-2: Theme Completeness.** Run on Campaign APPROVED transition. For each declared Theme, checks that every Theme-Variant field in every Campaign entity has a ThemeOverride. Severity: error (blocks Campaign APPROVED).

**Rule TVL-3: Technical Content Preservation.** Run on every KnowledgePanel ThemeOverride. Checks that the ThemeOverride does not alter the `example`, `command`, or `definition` fields — only `title`, `bodyFraming`, and `analogy`. Severity: error.

**Rule TVL-4: Dialogue State Parity.** Run on every CastMember and NPC ThemeOverride. Checks that the override provides a DialogueLine for every state defined in the base entity. A theme cannot silence a dialogue state by omission. Severity: error.

**Rule TVL-5: Boss Name Coherence.** Run at Campaign APPROVED. Checks that every Boss has a theme-specific name for each declared Theme. Nameless bosses in a supported theme break narrative. Severity: warning.

---

### Theme Expansion Rules

**Rule TE-1: Zero base-content modification.** Adding a new Theme requires writing only new ThemeOverride objects. No existing campaign file, stage file, cast file, or concept definition is modified.

**Rule TE-2: Template-driven expansion.** A Theme Expansion Checklist is derived automatically from the campaign's content map: "For Theme X, provide ThemeOverride for: Stage 1 title, Stage 1 region name, Stage 1 all NPC names, Stage 1 all dialogue lines..." This checklist is generatable from the content architecture without human enumeration.

**Rule TE-3: Incremental validation.** A new theme can be in partial authoring state (some stages complete, others not) without blocking Campaign PLAYABLE — provided the game enforces theme selection at campaign start and validates completeness before allowing that theme to be selected.

---

### Theme Compatibility Rules

**Rule TC-1: A content entity is theme-compatible if and only if it has explicit Theme-Variant field declarations.** An entity with no TV fields (e.g., a bare Beat envelope) is trivially compatible with any theme. An entity with TV fields must have those fields marked and authorable.

**Rule TC-2: Concepts are always theme-compatible.** Platform-level Concepts have no visible surface — they are identifiers (`concept:kubernetes:pod`). They require no theme treatment.

**Rule TC-3: Challenges are theme-compatible with a single TV field.** The `worldEventContext` framing text is Theme-Variant. The question, correct answer, and distractors are Theme-Invariant. A Challenge is compatible with any theme by overriding one field.

---

### Theme Migration Rules

**Rule TM-1: Theme changes are non-destructive.** Updating a Theme's definition (e.g., renaming "Space Galaxy" to "Cosmic Frontier") does not alter any base content. Only the Theme definition file changes; ThemeOverride objects remain valid.

**Rule TM-2: ThemeOverride updates are content updates.** If a theme's lore framing changes (the Space theme decides Pods are now "habitat pods" instead of "habitat modules"), all ThemeOverride objects for KnowledgePanel body framing must be updated. This is a content authoring task, not an architecture change.

**Rule TM-3: Deprecated themes are preserved.** A theme can be deprecated (no longer offered to players) without deleting its ThemeOverrides. This preserves historical content and allows revival if needed.

---

## Section 3 — Kubernetes Kingdom → Kubernetes Galaxy transformation

This is a concrete walkthrough of applying a Space theme to the existing Kubernetes Kingdom campaign.

### What stays absolutely identical

Everything in the Invariant Core:

- All concept references (Pods, Deployments, Services, etc.)
- All challenge questions, correct answers, and distractors
- All quest resolution conditions and mastery checks
- The full Beat sequence of every stage (type, position, order)
- All boss phase structures and concept requirements
- All progression thresholds and reward values
- The five recurring cast members' arcs, growth beats, and dialogue state structures
- The Severed Envoy's consequential chain, the Corrupted Warden's stand-down mechanic, the Isolation Wyrm's four-phase cross-concept structure

### What changes

| Entity | Fantasy version | Space version | Work estimate |
|---|---|---|---|
| Campaign title | Kubernetes Kingdom | Kubernetes Galaxy | Trivial |
| World framing | "The Kingdom" | "The Station" / "The Cluster" | Low |
| Stage titles (14) | The Hollow Fields, Podveil Village… | The Abandoned Sector, Hub-Node Colony… | Low |
| Region names (14) | Villages, forests, dungeons | Stations, corridors, server rooms | Low |
| All NPC names | Bram, Fen, Sera, Old Dorn… | Different names or adapted titles | Medium |
| All dialogue lines | Fantasy framing | Space framing | **High** (most content) |
| Enemy names | Shell Beetles, Pod Bugs… | Corrupted Modules, Cluster Ghosts… | Low |
| Boss names | Hollow Sovereign, Pod Tyrant… | Null Overseer, Node Tyrant… | Low |
| Knowledge panel framing | "Ancient scrolls reveal…" | "Recovered data packets contain…" | Medium |
| Item names | Crystal Shard, equipment names | Datacore Fragment, tech gear | Low |
| Ability names | Sword Strike, Shield | System Override, Firewall | Low |
| Cast member visual descriptors | "last archivist" | "last data keeper" | Low |

### No structural changes required

Not a single stage requires adding, removing, or reordering beats. Not a single quest requires changing its resolution condition. Not a single boss requires phase changes. The transformation is entirely surface.

### The transformation as an authoring task

A "Space Theme Author" for Kubernetes Galaxy writes:

1. One `themes/space-galaxy.yaml` definition (trivial — mostly metadata)
2. `campaigns/kubernetes-kingdom/themes/space-galaxy/` directory containing:
   - `campaign-override.yaml` — campaign title and world framing
   - `stages/stage-01-override.yaml` through `stage-14-override.yaml` — stage titles, region names, all dialogue
   - `cast/lyra-override.yaml` through `khaosynth-override.yaml` — all cast dialogue rewrites
   - `enemies-override.yaml` — all enemy names
   - `items-override.yaml` — all item and ability names

Total files: ~25. Total new content: entirely the visible surface. Zero gameplay or learning content touched.

Validation (`TVL-2 Theme Completeness`) confirms all TV fields are covered before the Space theme can be selected.

---

## Section 4 — Theme and the Blueprint Viewer

**Current state:** The Blueprint Viewer renders the theme-neutral base content. Beat nodes show concept references; NPC payloads show base names.

**Recommended approach:** The Blueprint Viewer should have a theme selector (currently inactive, future enhancement). When a theme is selected:
- All TV field displays switch to their ThemeOverride values
- TI fields remain unchanged
- The validation panel gains a new check: "Theme X completeness: N% covered"

This requires no architecture change — only an adapter update that merges ThemeOverrides onto base entities before building React Flow nodes.

**Validation in the viewer:** `TVL-1` (invariant core integrity) and `TVL-4` (dialogue state parity) should surface as Blueprint Viewer warnings. A content author should be able to see "this stage's Space theme is missing 3 NPC dialogue states" directly in the viewer.

---

## Section 5 — Future theme expansion

**Adding Cyberpunk theme — the authoring checklist:**

Automatically generated from the campaign content map:

```
Kubernetes Kingdom — Cyberpunk Theme Authoring Checklist

Campaign level:
  [ ] campaign title (cyberpunk variant)
  [ ] world framing text

Per stage (×14):
  [ ] stage title
  [ ] region name
  [ ] region description
  [ ] all NPC names (×1–3 per stage)
  [ ] all NPC dialogue states (×3–5 per NPC)
  [ ] all enemy names (×2–3 per stage)
  [ ] boss name and narrative description
  [ ] portal narrative text
  [ ] knowledge panel framing text (×4–7 per stage)

Campaign-level cast (×5):
  [ ] character name (optional — may keep)
  [ ] all dialogue lines across all stage appearances

Estimated authoring work: ~800 ThemeOverride field values
Structural work required: 0
```

The checklist is completable incrementally. Validation (`TVL-2`) prevents publishing until 100% complete.

---

## Cross-references

- `ai-vision.md §6 Tier C` — the foundational constraint this entire phase derives from
- `ai-beat-model.md` — Beat types are Theme-Invariant by design
- `ai-phase-02-03-quest-npc-castmember-model.md` — CastMember dialogue state model (TV-4 rule)
- `ai-phase-02-04-knowledge-challenge-model.md` — Challenge TV-field: worldEventContext only
- `ai-content-authoring-architecture.md` — E3 structure: ThemeOverrides co-locate with stage/cast files
- `ai-m02-decision-lock-review.md` — Theme-related open decisions
