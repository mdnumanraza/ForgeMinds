# FORGEMINDS — RUNTIME SYNTHESIS & MVP EXECUTION PLANNING

Context

Milestone 01 (Game Discovery) is complete.

Milestone 02 (Content Architecture) is complete.

Milestone 03 is in progress.

Completed:

* Technology Evaluation
* Engine Architecture
* Content Loading Pipeline

Locked decisions:

* Phaser + React Hybrid
* Single Next.js Application
* React Shell + Phaser Canvas
* Beat-Centric Architecture
* Campaign → Act → Stage → Beat hierarchy
* E3 Authoring Architecture
* YAML Authoring
* Concept Pool Challenge Architecture
* React-side BeatController
* BootScene + PreloaderScene + StageRuntimeScene
* Phaser owns world reality
* Zustand owns progression reality
* Hybrid content loading (runtime in dev, compile in prod)
* CompiledCampaign as the single canonical runtime object

Blueprint Viewer exists and works.

The project now has sufficient architecture to stop designing isolated subsystems and begin designing the complete runtime experience.

---

YOUR ROLE

Act as:

* Lead Game Director
* Principal Game Architect
* Technical Design Director
* Senior RPG Systems Designer
* Production Lead

Think like:

* A studio preparing to build its first playable vertical slice
* A team that must transform architecture into gameplay
* A team that wants the shortest path to proving the game is fun

---

IMPORTANT

Do NOT write implementation code.

Do NOT generate TypeScript.

Do NOT design APIs.

Do NOT create database schemas.

Focus on:

Runtime behaviour

Player experience

System interaction

Production planning

Vertical slice strategy

---

OBJECTIVE

Synthesize everything created so far into a coherent playable game runtime.

We have designed many parts.

Now answer:

How does the complete machine actually work?

What is the minimum version we should build first?

What order should development happen in?

---

PART 1 — RUNTIME EXECUTION ARCHITECTURE

Create:

technical-architecture/ai-runtime-execution-architecture.md

Design the complete lifecycle.

Trace a player from:

Game Launch

↓

Campaign Selection

↓

Campaign Load

↓

Stage Entry

↓

Exploration

↓

Knowledge Discovery

↓

NPC Interaction

↓

Quest Progression

↓

Enemy Encounter

↓

Boss Fight

↓

Portal Transition

↓

Stage Completion

↓

Campaign Completion

Explain:

* what happens
* who owns it
* what systems participate
* what data changes
* what events occur

for every step.

---

Required sections:

1. Boot Lifecycle
2. Campaign Lifecycle
3. Stage Lifecycle
4. Beat Lifecycle
5. Exploration Runtime
6. Knowledge Runtime
7. NPC Runtime
8. Quest Runtime
9. Encounter Runtime
10. Boss Runtime
11. Portal Runtime
12. Death & Retry Runtime
13. Save & Resume Runtime
14. Campaign Completion Runtime

---

At the end include:

Top Runtime Risks

Top Runtime Simplifications

Most Difficult Runtime Areas

---

PART 2 — VERTICAL SLICE DEFINITION

Create:

technical-architecture/ai-vertical-slice-definition.md

Assume:

We only have 2–4 weeks.

We need to prove ForgeMinds is fun.

What is the smallest playable version that demonstrates:

* exploration
* learning
* progression
* combat
* boss battle
* stage completion

without building the entire game?

---

Design:

Vertical Slice 1

Include:

* exactly which stage
* exactly which NPCs
* exactly which concepts
* exactly which enemies
* exactly which boss
* exactly which UI
* exactly which systems

must exist.

Everything else should be cut.

---

For every feature classify:

Required

Nice To Have

Cut For Later

---

At the end answer:

"What is the minimum game that proves the ForgeMinds vision?"

---

PART 3 — MVP PRODUCTION PLAN

Create:

technical-architecture/ai-mvp-production-plan.md

Assume:

One developer.

AI assistance available.

Limited art assets.

Need visible progress quickly.

---

Design:

Development Order

Not architecture order.

Build order.

---

Answer:

What gets built first?

What gets mocked?

What gets hardcoded?

What becomes reusable later?

What should not be built yet?

---

Define:

Phase 1
First Playable

Phase 2
Learning Loop

Phase 3
Combat Loop

Phase 4
Boss Loop

Phase 5
Vertical Slice Complete

Phase 6
Production Expansion

---

For each phase define:

Goals

Deliverables

Success Criteria

Risks

Dependencies

Estimated Complexity

---

PART 4 — REALITY CHECK

Create:

technical-architecture/ai-project-reality-check.md

Review everything created so far.

Answer:

What are we overengineering?

What are we underestimating?

What can be simplified?

What should be postponed?

What should be accelerated?

What would an experienced indie game developer do differently?

---

Provide:

Top 10 Risks

Top 10 Opportunities

Top 10 Simplifications

Top 10 Things To Avoid

---

FINAL OUTPUT

After all four documents are complete:

Provide a recommendation:

Should ForgeMinds continue architecture work?

OR

Is it time to begin implementation?

Support the recommendation with reasoning.

---

PROJECT MANAGEMENT

Update:

PROJECT_STATUS.md

README.md

Milestone tracking documents

Current focus

Next actions

Stop after completing these documents.

Do not continue into Phase 3.4 automatically.

Wait for review.
