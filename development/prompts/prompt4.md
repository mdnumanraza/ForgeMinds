# FORGEMINDS DOCUMENTATION REFACTOR

You are acting as a Staff Engineer, Technical Program Manager, and Game Production Director.

Your task is NOT to create new design content.

Your task is to audit, simplify, consolidate, and restructure the entire development documentation system.

The current documentation structure has become fragmented.

There are too many directories, too many phase artifacts, too many milestone artifacts, and too many files that partially overlap.

This increases maintenance burden and makes it difficult to understand:

* current project state
* completed work
* next actions
* canonical documents
* project progress

The goal is to create a clean production-grade documentation structure that can support ForgeMinds from planning through development.

---

# PRIMARY OBJECTIVES

1. Reduce file count significantly.
2. Eliminate duplicate sources of truth.
3. Create clear navigation.
4. Create clear progress tracking.
5. Create clear decision tracking.
6. Create clear human vs AI ownership.
7. Create a root README that acts as the project control center.
8. Ensure future Claude sessions can immediately understand project status.

---

# IMPORTANT RULE

Before deleting or merging anything:

Identify:

* canonical documents
* duplicate documents
* obsolete documents
* milestone artifacts
* temporary planning artifacts

Then propose a migration plan.

Do NOT lose information.

#

---

# REQUIRED NEW FILES

Create and maintain:

## PROJECT_STATUS.md

Single source of truth for:

* current milestone
* current phase
* current task
* completed milestones
* blockers
* next actions

This file must always answer:

"What should we work on next?"

within 30 seconds.

---

## CHANGELOG.md

Track major changes.

Format:

Date
Change
Reason

No implementation details.

Only significant project decisions.

---

## DECISIONS.md

Single ADR-style document.

Instead of dozens of ADR files.

Track:

Decision
Status
Reason
Date

---

## BACKLOG.md

Track:

Future ideas
Not yet approved ideas
Deferred work

This prevents ideas from being forgotten.

---

# README REQUIREMENTS

Create a root README that explains:

1. What ForgeMinds is
2. Current project state
3. Folder structure
4. Canonical documents
5. Where to start reading
6. Current milestone
7. Next milestone
8. Human responsibilities
9. AI responsibilities

A new Claude session should understand the project in less than 5 minutes by reading:

README.md
PROJECT_STATUS.md

only.

---

# HUMAN VS AI OWNERSHIP

Clearly identify:

AI-owned documents

Human-owned documents

Mixed-ownership documents

Avoid unnecessary ai-/you- files when ownership is obvious.

---

# DELIVERABLE

Produce:

1. Documentation audit
2. Proposed new structure
3. File migration plan
4. Canonical document list
5. Progress tracking system
6. Root README redesign
7. Status tracking redesign

Do NOT generate implementation code.

Focus entirely on documentation architecture and project management.
