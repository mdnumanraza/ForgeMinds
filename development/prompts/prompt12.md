# FORGEMINDS — PHASE 2.6.5 CONTENT AUTHORING ARCHITECTURE

Context:

Milestone 02 is approaching completion.

We now have:

* Vision
* Gameplay Loop
* Campaign Design
* Beat-Centric Architecture
* Content Hierarchy
* Campaign/Act/Stage Models
* Quest/NPC Models
* Knowledge Models
* Challenge Models
* Enemy/Boss Models
* Blueprint Viewer
* Validation Engine

The Blueprint Viewer has revealed an important architectural question:

We still do not have a clearly defined canonical content authoring model.

Before moving into Theme Variant Design and Milestone 03, we must answer:

"How is ForgeMinds content actually authored?"

This phase exists to answer that question.

---

# YOUR ROLE

Act as:

* Principal Game Systems Architect
* Senior Content Pipeline Architect
* Technical Narrative Designer
* Tooling Architect

Think like:

* Unreal Engine Content Teams
* RPG Quest Tooling Teams
* Narrative Tooling Teams
* Game Studio Internal Tool Designers

---

# PHASE OBJECTIVE

Design the canonical content authoring architecture for ForgeMinds.

This is NOT a storage phase.

This is NOT a JSON schema phase.

This is NOT an implementation phase.

This is an authoring workflow phase.

We are designing:

How content is created.

How content is maintained.

How content is reviewed.

How content becomes playable.

---

# CORE QUESTION

If a future content designer wants to create:

Ingress Fortress

or

Linux Realms

or

Terraform Frontier

What files do they edit?

What is the source of truth?

How does that content travel through the system?

---

# IMPORTANT

DO NOT choose:

* JSON
* YAML
* Database
* TypeScript
* Markdown

yet.

We are not selecting storage technology.

We are selecting the authoring architecture.

Storage format selection belongs later.

---

# REQUIRED INVESTIGATION

Evaluate multiple authoring models.

For each:

Advantages

Disadvantages

Scaling Characteristics

AI Compatibility

Blueprint Compatibility

Validation Compatibility

Human Author Experience

Maintenance Burden

Future Editor Compatibility

---

# MODEL A

Stage-Centric

Example:

One file owns an entire stage.

Stage contains:

* beats
* quests
* enemies
* rewards
* dialogue
* discoveries

Everything lives together.

Evaluate thoroughly.

---

# MODEL B

Entity-Centric

Separate files:

* NPCs
* Quests
* Enemies
* Bosses
* Discoveries

Stages reference entities.

Evaluate thoroughly.

---

# MODEL C

Beat-Centric

Every Beat becomes an authorable object.

Stages become ordered Beat collections.

Evaluate thoroughly.

---

# MODEL D

Campaign-Centric

Large campaign documents.

Stages derived from campaign structure.

Evaluate thoroughly.

---

# MODEL E

Hybrid Models

Investigate combinations.

Examples:

Stage + referenced entities

Beat + referenced entities

Campaign + stage ownership

Or any alternative architecture you believe is superior.

---

# AUTHORING WORKFLOW ANALYSIS

For each model answer:

A content designer wants to:

1. Create a new stage
2. Add a new NPC
3. Modify a boss
4. Add a discovery
5. Add a challenge
6. Add a side quest
7. Create a new campaign

What does that workflow look like?

How many files are touched?

How much complexity is introduced?

---

# BLUEPRINT VIEWER IMPACT

The Blueprint Viewer already exists.

Analyze:

Which authoring architecture maps most naturally to:

Campaign View

Stage View

Beat View

Validation Layer

Future Visual Editing

Future Drag-and-Drop Editing

---

# AI CONTENT GENERATION

Future ForgeMinds will likely use AI-assisted authoring.

Analyze:

Which model is easiest for:

Generate Stage

Generate Quest

Generate NPC

Generate Campaign

Generate Theme Variant

Generate Beat Sequence

Provide examples.

---

# VALIDATION IMPACT

Which model makes it easiest to validate:

Knowledge before challenge

Boss concept coverage

Missing discoveries

Broken quest chains

Dead-end stages

Progression mistakes

Theme inconsistencies

Campaign integrity

---

# FUTURE EDITOR ROADMAP

Assume future milestones include:

Visual Campaign Editor

Visual Stage Editor

Visual Beat Editor

AI Content Generation

Theme Variant Generator

Which architecture supports this best?

Which architecture creates future technical debt?

---

# RECOMMENDATION

At the end:

Provide:

1. Recommended Authoring Architecture
2. Why it wins
3. Why alternatives lose
4. Migration cost from current state
5. Risks
6. Open questions

---

# DELIVERABLES

Create:

content-architecture/ai-content-authoring-architecture.md

content-architecture/ai-authoring-workflow-examples.md

Update:

PROJECT_STATUS.md

README.md if necessary

---

# IMPORTANT FINAL RULE

Do NOT choose storage technology.

Do NOT create schemas.

Do NOT create JSON examples.

Do NOT create implementation plans.

This phase ends when we know:

"What should content authors edit?"

not

"How should the engine load it?"
