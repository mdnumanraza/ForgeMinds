---

# CUSTOM LEARNING WORLD SYSTEM

One of the CORE foundations of this platform is fully customizable learning world creation.

The platform must be designed so that users, creators, educators, or future AI systems can dynamically create entirely new learning campaigns without changing application code.

This is a CRITICAL architecture requirement.

The system must be content-driven.

---

# CORE IDEA

Users should be able to create custom learning experiences by supplying structured JSON configurations.

These JSON files define:

1. Game World Configuration
2. Learning Content Configuration

The engine dynamically combines both to generate immersive playable learning campaigns.

This architecture is extremely important for:
- scalability
- creator ecosystem
- AI-generated worlds
- future marketplace support
- procedural generation
- modular content creation

The application must NEVER hardcode worlds or learning flows.

Everything should be driven by validated schemas.

---

# REQUIRED CONTENT ARCHITECTURE

Each learning campaign/world consists of:

## 1. WORLD CONFIG JSON

Controls:
- world theme
- biome
- environment
- terrain
- visual atmosphere
- NPCs
- enemy types
- lore
- story progression
- stage aesthetics
- boss identity
- soundtrack mood
- environmental effects
- progression map structure
- unlock animations
- world difficulty profile

This JSON controls the GAME EXPERIENCE layer.

Example concepts:
- fantasy forest
- cyberpunk city
- space station
- ancient ruins
- magical academy
- hacker underground
- dystopian network realm

The engine should render different experiences from configuration only.

---

## 2. KNOWLEDGE CONFIG JSON

Controls:
- learning topics
- subtopics
- stages
- levels
- micro-lessons
- quests
- practical tasks
- MCQs
- challenge encounters
- boss objectives
- skill requirements
- XP rewards
- unlock conditions
- hints
- adaptive difficulty metadata
- estimated completion time
- prerequisite chains

This JSON controls the LEARNING EXPERIENCE layer.

The knowledge system must support:
- tiny learning chunks
- progressive difficulty
- concept dependency mapping
- practical learning
- active recall
- challenge-based learning

---

# WORLD STRUCTURE REQUIREMENTS

Users should be able to define:

- number of worlds
- number of biomes
- number of stages
- stage difficulty progression
- branching progression paths
- hidden stages
- optional side quests
- boss fights
- unlockable content
- adaptive challenge scaling

The architecture must support:
- linear progression
- branching trees
- open exploration
- locked progression paths

---

# DYNAMIC ENGINE REQUIREMENTS

The application engine must dynamically:

- render worlds from JSON
- generate progression maps
- generate stage flows
- load NPCs dynamically
- render enemies dynamically
- generate quests dynamically
- track progression dynamically
- support future AI-generated content
- support future creator marketplace integration

Avoid hardcoded game logic tied to specific worlds.

The engine must be generic and extensible.

---

# CONTENT VALIDATION REQUIREMENTS

The JSON system MUST include:

- strict schema validation
- type safety
- runtime validation
- versioning support
- migration support
- backward compatibility planning

Choose professional schema systems.

Suggested directions:
- Zod
- JSON Schema
- TypeBox
- OpenAPI-compatible validation

Explain tradeoffs professionally.

---


## Visual World Editor
Users visually create:
- maps
- stages
- NPC flows
- progression trees

## Learning Editor
Users visually create:
- quests
- lessons
- challenges
- boss fights
- XP systems

The architecture must prepare for future no-code content creation.

---

# AI CONTENT GENERATION SUPPORT

Future AI systems should be able to generate:
- worlds
- quests
- stories
- enemies
- lessons
- boss fights
- adaptive progression

Therefore:
- content systems must be modular
- schemas must be deterministic
- structures must be AI-friendly
- systems must support procedural generation

---

# REQUIRED DEVELOPMENT OUTPUT

Inside `/development/content-system.md` provide:

1. Complete JSON architecture design
2. Schema structure
3. Validation strategy
4. Content loading pipeline
5. Runtime rendering flow
6. Dynamic world generation flow
7. Learning progression mapping
8. Content versioning strategy
9. Migration strategy
10. Future creator marketplace architecture
11. Future no-code editor compatibility
12. AI generation compatibility strategy

Provide production-grade architecture planning.

---