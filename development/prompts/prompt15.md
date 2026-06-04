# FORGEMINDS — PHASE 3.3 CONTENT LOADING PIPELINE

Context

Milestone 01 and Milestone 02 are complete.

Milestone 03 is in progress.

Locked decisions:

D-20
Phaser + React Hybrid

D-20A
Single Next.js Application

D-21
React Shell + Phaser Canvas

D-22
Hybrid Content Loading

* Runtime YAML parsing in development
* Build-time compilation in production

D-23
State Boundaries

* Phaser owns frame/runtime state
* Zustand owns session/progress state
* Persistence layer owns saves

D-24A
React-side Beat Controller

D-24B
BootScene + PreloaderScene + StageRuntimeScene

D-24C
World Reality Ownership

D-25
One Beat = One Completion Condition

D-26
Campaign Model never enters Phaser

E3 Authoring Architecture:

campaigns/
├── campaign.yaml
├── cast/
└── stages/

Challenge Architecture:

Concept Pool Model

Theme Architecture:

Theme-Invariant Gameplay
+
Theme-Variant Presentation

Blueprint Viewer already exists.

---

ROLE

Act as:

* Principal Platform Architect
* Senior Content Pipeline Engineer
* Senior Game Engine Architect
* Technical Designer

Think like:

Unreal Content Pipeline
+
Unity Addressables
+
RPG Quest Runtime
+
Content Authoring Platforms

---

PHASE OBJECTIVE

Design the complete content loading pipeline.

Answer:

How does ForgeMinds transform authored YAML files into executable gameplay?

---

IMPORTANT

This is an architecture phase.

Do NOT write implementation code.

Do NOT create TypeScript interfaces.

Do NOT create runtime code.

Do NOT design databases.

Focus on:

Flow
Ownership
Boundaries
Validation
Transformation

---

PRIMARY QUESTION

A content author creates:

campaign.yaml

stage-01.yaml

lyra.yaml

question-pool.yaml

What happens next?

Trace the entire lifecycle.

---

DESIGN THE PIPELINE

Starting point:

Raw YAML Files

Ending point:

Executable Campaign Object

Consumed by:

Blueprint Viewer

Game Runtime

Future Editor

Future AI Systems

---

Investigate and define:

Stage 1
Content Discovery

How files are discovered

How campaigns are located

How content packs are registered

How future campaigns fit in

---

Stage 2
Validation

What is validated first?

What validation layers exist?

What blocks loading?

What produces warnings?

What produces errors?

---

Stage 3
Reference Resolution

How stage references become objects

How cast references resolve

How quest references resolve

How challenge references resolve

How circular references are prevented

How missing references are handled

---

Stage 4
Challenge Pool Resolution

How Concept Pools become challenge selections

How enemies receive challenges

How bosses receive challenge sets

How difficulty filtering works

How randomness works

How deterministic behaviour is maintained

---

Stage 5
Theme Resolution

How Kubernetes Kingdom becomes Kubernetes Galaxy

How theme overrides apply

What data is transformed

What remains invariant

How validation confirms compatibility

---

Stage 6
Campaign Compilation

Define:

Compiled Campaign Object

What information exists in it

What does not exist in it

Who consumes it

When it is created

When it is discarded

---

Stage 7
Runtime Consumption

How BeatController consumes compiled content

How Blueprint Viewer consumes compiled content

How both remain synchronized

How they avoid separate content models

---

D-27 CONTENT VERSIONING

New Decision

Design content versioning strategy.

Answer:

How does a save know which content version it belongs to?

How do campaign updates affect saves?

How do future campaign revisions work?

How can Blueprint Viewer and Runtime remain compatible?

No migration system needed yet.

Only architecture.

---

ERROR STRATEGY

Design:

Fatal Errors

Recoverable Errors

Warnings

Validation Reports

Author Feedback

Future Editor Feedback

---

FUTURE REQUIREMENTS

The architecture must support:

Additional Campaigns

Additional Themes

AI Generated Campaigns

Visual Content Editor

Campaign Marketplace

Community Content Packs

Without redesigning the pipeline.

---

DELIVERABLES

Create:

milestones/milestone-03-technical-architecture/ai-content-loading-pipeline.md

Include:

1. Pipeline Overview
2. Loading Lifecycle
3. Validation Architecture
4. Reference Resolution Architecture
5. Theme Resolution Architecture
6. Challenge Resolution Architecture
7. Compiled Campaign Object
8. Content Versioning (D-27)
9. Error Strategy
10. Future Scalability Analysis

---

ADDITIONAL REVIEW

At the end provide:

Top 5 Future Risks

Top 5 Future Opportunities

Recommended Next Phase Inputs

---

PROJECT MANAGEMENT

Update:

PROJECT_STATUS.md

README.md

if required.

Stop after Phase 3.3.

Do not begin Phase 3.4.
