# ForgeMinds — Master Roadmap

> **Status:** Draft v1 — high-level only. Each milestone will be detailed in its own folder under `development/04-milestones/`.
> **Owned by:** AI

## Overview

ForgeMinds is a retro-style RPG learning platform whose first title is Kubernetes Kingdom — a single-player adventure where the player learns Kubernetes by exploring a world, talking to NPCs, taking on quests, and defeating bosses, not by answering quiz questions. The game ships in two visual themes (Fantasy Kingdom and Space Galaxy) over the same underlying content, covering roughly twelve to fifteen stages from Containers through the Final Kingdom Challenge. This roadmap is the top-level plan that sequences the work from "we have an idea" to "we have a shippable game" without committing to any specific gameplay system before the right discovery work has been done.

## How to read this roadmap

This file is the executive summary. Each of the fifteen milestones below will eventually have its own folder under `development/04-milestones/`, containing the detailed plan, decision records, schemas, and validation criteria for that milestone. Read this file to understand the shape and order of the project; read the per-milestone folders to understand the substance.

The repository follows a file-ownership convention: documents prefixed `ai-` are AI-owned (AI is the primary author and keeper), and documents prefixed `you-` are human-owned (a human must fill them in — typically asset inventories, account credentials, business decisions). This master roadmap is `ai-`.

Crucially, this roadmap does not lock any gameplay decisions. The gameplay loop, progression model, world structure, learning-delivery format, and combat/challenge model are all explicitly deferred to Milestone 03. If a paragraph below sounds like it is hinting at a specific game design, read it as scope rather than a commitment.

## Planning order (upstream of code)

The first five milestones — Game Discovery, Architecture Discovery, Design Decisions, Content Architecture, and Asset Strategy — are pure planning. They produce the vision, the candidate architectures, the locked design decisions, the content schemas, and the asset plan that everything downstream depends on. No engine code is written until those five are complete; building runtime systems before the content schema and design decisions exist would mean rewriting them as soon as those decisions land. The remaining ten milestones build on that foundation in roughly the order a player experiences the game: foundation, world, NPCs, quests, learning, encounters, bosses, persistence, theming, and finally the polish and content pass that turns a working game into a shipped one.

## The 15 milestones

### Milestone 01 — Game Discovery

This milestone defines what Kubernetes Kingdom actually is before any system is designed. It produces the vision statement, the target feel (the games and moments we are taking inspiration from), the player fantasy, the explicit non-goals, and a small set of success criteria the finished game can be measured against. It comes first because every later decision — architectural, content, or systemic — implicitly answers "is this faithful to the game we said we were making?", and that question cannot be answered without an artifact to point at. This milestone explicitly does not lock any system: no combat model, no progression curve, no UI direction, no engine choice. Skipping it would mean every later milestone re-litigates the vision from scratch, and the project would drift toward whatever feels easiest to build that week.

### Milestone 02 — Architecture Discovery

Architecture Discovery surveys candidate technical architectures across the dimensions that matter for an RPG of this kind: rendering approach, state management, content storage and loading, data flow between systems, the AI layer (since content is partly AI-authored), and the save subsystem. It produces a comparison of two or three viable architectural shapes with their trade-offs, not a single locked choice — the lock happens in Milestone 03 as an ADR. It comes second because the vision from Milestone 01 narrows the architectural search space (a turn-based learning RPG has very different requirements from a real-time action game), and because the design decisions in Milestone 03 cannot be made responsibly without knowing what is technically reasonable. Skipping this milestone risks committing to a gameplay loop the chosen tech cannot deliver, or vice versa.

### Milestone 03 — Design Decisions

This is the milestone where the project stops exploring and starts committing. It locks the gameplay loop, the progression model, the world structure, the learning-delivery model (how Kubernetes concepts reach the player through play), and the combat or challenge model — each as an Architecture Decision Record so the reasoning is preserved. It also locks the architectural choice surfaced in Milestone 02. It must come after Discovery because committing earlier means committing without evidence; it must come before Content Architecture because the content schemas are derived from these decisions. If this milestone is skipped or rushed, every downstream milestone is built on assumptions that quietly disagree with each other, and the project pays for it during integration.

### Milestone 04 — Content Architecture

Content Architecture designs the data shapes for everything the game contains: campaigns, stages, quests, NPCs, enemies, bosses, dialogue, in-game knowledge checks, rewards, and items. It defines how content is authored (by AI, by humans, or both), how it is themed (Fantasy versus Space without forking the content), and how it is loaded at runtime. The output is a set of schemas and authoring conventions, not the content itself. It depends on Milestone 03 because the schema for "a quest" or "a boss encounter" is a function of the locked gameplay loop and learning model — designing schemas before those are settled produces fields that are wrong in subtle ways. Skipping it leads to ad-hoc content shapes scattered across systems and a painful migration the first time a designer needs a new field.

### Milestone 05 — Asset Strategy

Asset Strategy plans every category of asset Kubernetes Kingdom needs across both Fantasy and Space themes — sprites, tilesets, portraits, UI, music, sound effects, fonts — and identifies which assets exist, which can be sourced, and which must be created or commissioned. It produces a `you-asset-inventory` style tracker so a human can fill in licenses, sources, and gaps over time. It comes after Content Architecture because the content schemas tell us which asset slots actually exist (you cannot plan portraits before you know NPCs have portraits), and before any engine work because the engine's asset loader is shaped by the asset categories and formats. Skipping it means discovering missing art halfway through implementation, which is the most expensive time to discover it.

### Milestone 06 — Core Engine Foundation

This milestone plans the runtime substrate the rest of the game stands on: scene graph, update loop, input handling, camera, asset loading, and time and state management. It is the first milestone where implementation work follows naturally from the plan, though the milestone itself produces a design document and validation criteria, not finished code. It comes after the planning quintet because the engine's shape depends on the architecture chosen in Milestone 03, the content shapes from Milestone 04, and the asset categories from Milestone 05. If this milestone is skipped, every later system reinvents its own version of "how do I load a thing" or "how do I tick" and the codebase fragments into incompatible halves.

### Milestone 07 — World Navigation

World Navigation plans how the player moves through the game world: tile or world rendering, region transitions, the minimap if there is one, and the rules around fast-travel. The exact shape — overworld plus dungeons, hub plus levels, single contiguous map, or something else — flows from the world structure decision locked in Milestone 03, so this milestone is plan-only until that input exists. It comes early in the runtime sequence because navigation is the player's primary verb outside of encounters, and because NPCs, quests, and encounters all need a world to live in. Skipping it leaves later systems with no consistent way to express "where" anything happens.

### Milestone 08 — NPC Interactions

This milestone plans the cast: NPC types, dialogue trees, the state and schedule model (do NPCs change behavior over time, between quests, or between regions?), and the hooks NPCs expose to the quest system. It produces the dialogue authoring format, the runtime dialogue interpreter design, and the NPC lifecycle. It comes after World Navigation because NPCs need to be placed in a world, and before the Quest System because quests are typically given, advanced, and resolved through NPCs — designing quests against an undefined NPC contract leads to retrofitting. Skipping it forces the quest system to invent its own thin NPC model, which then conflicts with the real one when it lands.

### Milestone 09 — Quest System

The Quest System milestone plans the quest data model, the lifecycle of a quest from offered through active to completed or failed, the journal UI that surfaces quests to the player, branching and prerequisite logic, and the reward pipeline. It is the connective tissue between the world, NPCs, the learning system, and combat — quests are how the game says "go do this thing now." It depends on the world and NPC milestones for the verbs it composes, and the Learning System milestone depends on it because Kubernetes concepts will be delivered largely through quest content. Skipping it means concept delivery has no narrative scaffolding and the game collapses into a stage-select menu.

### Milestone 10 — Learning System

This milestone plans how Kubernetes concepts are introduced, practiced, and verified through gameplay rather than through quizzes or flashcards. The exact mechanism — environmental puzzles, NPC conversations, item use, encounter mechanics, or some combination — flows from the learning-delivery model decided in Milestone 03, and the implementation flows from the quest, NPC, and encounter systems already planned. It produces the design for how a stage like "Pods" or "Services" actually teaches its concept in-world, and the verification rule that says "the player understood this well enough to advance." It must come after Quest System because most learning beats are quest-shaped. Skipping it leaves the project as a generic RPG with Kubernetes-themed sprites, which is the failure mode this whole product is built to avoid.

### Milestone 11 — Enemy Encounters

Enemy Encounters plans the routine combat or challenge encounters that fill the space between bosses: encounter framing, enemy AI shapes, encounter pacing across a stage, and difficulty scaling as the player progresses. The challenge model itself is locked in Milestone 03, so this milestone is concerned with the texture and rhythm of encounters rather than the rules. It comes after the Learning System because in this game encounters are partly a verification surface — they are one of the places concept understanding gets exercised — and the learning model has to exist first. Skipping it leaves the game with bosses but no terrain between them, and the difficulty curve becomes a staircase rather than a slope.

### Milestone 12 — Boss Battles

This milestone plans the boss encounters that cap each stage: boss design philosophy, mechanics, multi-phase fight structure, the way knowledge gates a boss (the player must understand the stage's concept to win, in whatever form Milestone 03 settled on), and the narrative payoff of each defeat. Bosses are where the stage's lesson is finally cashed in, which is why this milestone comes after both the Learning System and Enemy Encounters: the boss is the culmination of those systems, not a separate thing. Skipping it means each stage ends in a whimper, and the player never gets the moment where a hard-won concept becomes a literal weapon.

### Milestone 13 — Save System

The Save System milestone plans the save data shape, the slot model, the autosave triggers, the migration strategy for when the data shape changes between versions, and the anti-corruption rules that keep a bad write from destroying a player's progress. It comes late because the save schema is the union of every other system's persisted state, and designing it before those systems are planned produces a save format that is wrong by the time the systems land. It also comes before Content Expansion so that long-form playtesting has a save system to lean on. Skipping it means players lose progress, which for a learning game also means losing motivation.

### Milestone 14 — Theme Engine

Theme Engine plans the mechanism that lets the same content render as Fantasy Kingdom or Space Galaxy without forking the content authoring pipeline. It is a thin layer over the content schemas defined in Milestone 04 — the schemas have to support theming from the start, which is why the theme engine is plan-late, design-early. The plan covers the asset variant resolver, the string and dialogue variant resolver, the theming hooks each system exposes, and the rules for when a theme is allowed to differ semantically versus only cosmetically. Skipping it means shipping two games' worth of content for one game's price, or shipping one game with a Fantasy skin and a half-finished Space skin.

### Milestone 15 — Content Expansion & Polish

The final milestone plans the content production pipeline at scale, the balancing pass across stages, accessibility, "juice" (the small responsive feedback that makes a retro RPG feel good rather than merely functional), telemetry for understanding how players actually move through the game, and the launch readiness checklist. It comes last because polish on an unfinished system is wasted work, and content scale-up before the systems are stable just produces content that has to be rewritten. It is also the milestone that answers "are we actually done?" — its exit criteria are the project's exit criteria. Skipping it means shipping a tech demo and calling it a game.

## Critical dependencies

- Milestone 03 (Design Decisions) depends on both 01 (Game Discovery) and 02 (Architecture Discovery) — locking design without vision or feasibility is gambling.
- Milestone 04 (Content Architecture) depends on 03 — content schemas are derivatives of the gameplay loop and learning model, not inputs to them.
- Milestones 06 through 13 depend on 04 and 05 — engine, world, NPCs, quests, learning, encounters, bosses, and save all consume the content schemas and asset categories.
- Milestone 09 (Quest System) depends on 07 (World) and 08 (NPCs) — quests compose verbs the world and NPC systems must already provide.
- Milestone 10 (Learning System) depends on 09 (Quest System) — most learning beats are quest-shaped.
- Milestone 12 (Boss Battles) depends on 10 (Learning) and 11 (Enemy Encounters) — bosses are the culmination, not a parallel track.
- Milestone 13 (Save System) depends on every system that persists state — it is necessarily late.
- Milestone 14 (Theme Engine) depends on 04 — theming has to be designed into the content schemas, not bolted on after.

## What is intentionally NOT in this roadmap

- "Coding" is not a milestone. Implementation happens inside the engine and system milestones, against their plans, and is gated by their validation criteria.
- "Testing" is not a milestone. Each milestone defines its own validation criteria; there is no separate phase where testing finally happens.
- Marketing, monetization, store presence, and community management are out of scope for v1.
- Expansion to additional games beyond Kubernetes Kingdom (a second curriculum, a second IP) is out of scope for this roadmap, even though the platform is named "ForgeMinds" deliberately to leave that door open.
- A specific game engine, rendering library, or art tool is intentionally not named here — that lives in Milestone 02's output and Milestone 03's ADR.

## Revision policy

This roadmap is a living document, but the fifteen milestone names and their order are locked at this revision. Renaming or reordering a milestone requires a new ADR under `development/decisions/` that names what changed and why. Expanding a milestone into multiple milestones is permitted when scope is genuinely larger than one folder can hold — also via ADR — but contracting or dropping milestones is not, because every milestone here exists to prevent a specific failure mode that has been seen on similar projects.
