# FORGEMINDS — MILESTONE 02 CONTENT ARCHITECTURE

Milestone 01 (Game Discovery) is now complete.

Campaign Design is considered CLOSED.

Do not reopen campaign discussions unless a critical flaw is discovered.

The next objective is:

MILESTONE 02 — CONTENT ARCHITECTURE

---

# YOUR ROLE

Act as:

* Principal Game Systems Architect
* Senior RPG Systems Designer
* Senior Content Pipeline Architect

Think like someone building:

* Pokémon
* Stardew Valley
* Skyrim
* World of Warcraft quest systems

but for a learning RPG.

Focus on:

How content is represented.

NOT:

How content is rendered.

NOT:

How content is implemented.

NOT:

Technology.

NOT:

Phaser.

NOT:

Next.js.

---

# PROJECT CONTEXT

ForgeMinds is a story-driven RPG learning game.

Current campaign:

Kubernetes Kingdom

Future campaigns:

* Linux Realms
* Docker Dominion
* Networking Galaxy
* Terraform Frontier
* Ansible Kingdom

The game engine must support future campaigns without code changes.

Goal:

Game Engine
+
Campaign Content
================

Playable Campaign

Campaigns should be content-driven.

Not code-driven.

---

# MILESTONE OBJECTIVE

Design the complete content architecture for ForgeMinds.

Answer:

How is game content represented?

How is game content organized?

How do all content pieces connect together?

How can future campaigns be created without changing code?

---

# IMPORTANT RULES

Do NOT write JSON schemas yet.

Do NOT write TypeScript interfaces yet.

Do NOT write database schemas yet.

Do NOT write implementation details.

Stay conceptual.

We are designing the model before designing storage.

---

# STEP 1 — REVIEW EXISTING DOCUMENTS

Read:

* game-design/ai-vision.md
* game-design/ai-gameplay-loop.md
* game-design/ai-kubernetes-kingdom-campaign.md
* game-design/ai-campaign-review-resolution.md

Create a short dependency summary.

Identify:

* systems already locked
* systems still undefined

---

# STEP 2 — PROPOSE MILESTONE STRUCTURE

Before creating any architecture documents:

Design Milestone 02 itself.

Create:

milestone-02-content-architecture/ai-overview.md

Define:

Purpose

Goals

Deliverables

Success Criteria

Risks

Dependencies

Exit Criteria

Phases

---

# STEP 3 — PROPOSE PHASE BREAKDOWN

Propose 6–10 phases.

Example only:

Phase 1
Content Hierarchy

Phase 2
Campaign Model

Phase 3
Stage Model

Phase 4
Quest Model

Phase 5
Knowledge Model

Phase 6
Enemy & Boss Model

Phase 7
Rewards & Progression Model

Phase 8
Validation Review

Do NOT assume this structure.

Create the best structure.

---

# STEP 4 — DEFINE REQUIRED DOCUMENTS

For every phase:

Define:

Document Name

Purpose

Expected Output

Dependencies

Review Requirements

Owner

(ai / human / shared)

---

# STEP 5 — CONTENT SYSTEM AUDIT

Identify every content entity required by ForgeMinds.

Examples:

Campaign

Act

Stage

Quest

NPC

Enemy

Boss

Knowledge Discovery

Question

Reward

Inventory Item

Spell

Weapon

Achievement

Progress

Theme

Dialogue

Cutscene

etc.

Do not design them yet.

Only identify them.

Group them logically.

---

# STEP 6 — IDENTIFY CRITICAL DECISIONS

List decisions that must be made during Milestone 02.

Examples:

Should NPC dialogue be embedded or referenced?

Should questions belong to enemies or content pools?

Should bosses contain questions or reference challenge sets?

Should rewards be stage-driven or quest-driven?

Do not answer them yet.

Only identify them.

---

# STEP 7 — CREATE MILESTONE PLAN

Produce:

A complete Milestone 02 execution plan.

The plan should be detailed enough that future Claude sessions can execute the milestone without needing rediscovery.

---

# DELIVERABLES

Create:

1. milestone-02-content-architecture/ai-overview.md

2. milestone-02-content-architecture/ai-phase-plan.md

3. milestone-02-content-architecture/ai-content-entity-inventory.md

4. Update PROJECT_STATUS.md

5. Update README navigation if required

---

# AFTER COMPLETION

STOP.

Do NOT begin designing content entities yet.

Do NOT create schemas yet.

Do NOT create architecture documents yet.

Only complete Milestone 02 planning.

We will review the milestone structure before executing Phase 1.
