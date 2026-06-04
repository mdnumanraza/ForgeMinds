# FORGEMINDS — VISUAL CONTENT BLUEPRINT SPIKE (REACT FLOW)

Context:

We are currently in Milestone 02 (Content Architecture).

ForgeMinds has adopted a Beat-centric architecture.

Canonical hierarchy:

Campaign
→ Act
→ Stage
→ Beat

Beats are the atomic unit of gameplay.

Examples:

* Arrival Beat
* Dialogue Beat
* Discovery Beat
* Quest Beat
* Enemy Beat
* Reward Beat
* Dungeon Beat
* Boss Beat
* Portal Beat

We are NOT building a full editor.

We are building a proof-of-concept visual blueprint system.

The purpose is:

1. Make content readable
2. Make content reviewable
3. Visualize stage flow
4. Detect structural problems
5. Prepare for future editor tooling

---

# YOUR ROLE

Act as:

* Senior Game Tools Engineer
* Senior UX Architect
* Technical Designer
* React Flow Expert

Think like:

Unreal Blueprints
+
Node-RED
+
Quest Editors
+
Narrative Graph Tools

---

# OBJECTIVE

Design and implement:

Visual Content Blueprint Viewer

using:

React Flow

inside the existing Next.js application.

---

# IMPORTANT

This is NOT an editor.

No drag-and-drop persistence.

No save system.

No backend.

No campaign authoring.

Read-only visualization first.

---

# PHASE 1 DELIVERABLE

Create:

Blueprint Viewer

Input:

Stage Content Object

Output:

Interactive Flow Graph

Example:

Arrival
↓
Dialogue
↓
Discovery
↓
Enemy
↓
Reward
↓
Boss
↓
Portal

---

# REQUIRED NODE TYPES

Create visual node types for:

Campaign

Act

Stage

Beat

Within Beat:

* Arrival
* Dialogue
* Discovery
* Quest
* Enemy
* Reward
* Dungeon
* Boss
* Portal

Node visuals can be simple.

Focus on structure.

---

# REQUIRED VIEWS

## 1. Campaign View

Shows:

Campaign
↓
Acts
↓
Stages

Purpose:

High-level navigation

---

## 2. Stage View

Shows:

Stage
↓
Ordered Beat Sequence

Purpose:

Review gameplay flow

---

## 3. Beat Detail Panel

Clicking a Beat shows:

* Beat Type
* Purpose
* Learning Goal
* Related NPCs
* Related Quests
* Related Enemies

Mock data is acceptable.

---

# VALIDATION LAYER

Add visual warnings for:

Missing Boss

Missing Discovery

Enemy before Discovery

Portal without Boss

Disconnected Beats

Empty Stage

Broken References

Display warnings visually.

No persistence required.

---

# DATA ARCHITECTURE

DO NOT hardcode stages.

Create a mock data adapter layer.

React Flow should consume:

Campaign Model

not

React Components

The renderer must be content-driven.

---

# FUTURE READINESS

Design the architecture so that later we can add:

* Drag & Drop
* Editing
* AI Generation
* Export
* Import
* Validation Rules
* Multi-Campaign Support

without major rewrites.

Do not implement them.

Only leave extension points.

---

# DELIVERABLES

Create:

1. Visual Blueprint Viewer

2. Blueprint Architecture Document

3. Node Type Definitions

4. Validation Rule Definitions

5. Future Editor Roadmap

6. Update README

7. Update PROJECT_STATUS

---

# SUCCESS CRITERIA

A future content author should be able to:

1. Open a Stage
2. See all Beats visually
3. Understand gameplay flow in seconds
4. Spot structural issues visually
5. Navigate without reading large documents

The visual graph should become the preferred way to review stage design.

---

# OUT OF SCOPE

No database

No backend

No saving

No multiplayer

No real content authoring

No AI generation

No production editor

Only visualization and validation.

Build the smallest possible foundation that future editor tooling can grow from.
