# FORGEMINDS — T-04 + T-05 IMPLEMENTATION

Context

T-01 complete:
Phaser mounted successfully.

T-02 complete:
Player movement.

T-03 complete:
Camera follow.

All acceptance criteria passed.

Current world:

* 2000x2000 debug world
* player rectangle
* camera
* debug overlay

The game now needs a proper stage structure.

---

Objective

Implement:

T-04 World Obstacles + Collision

T-05 Stage Loading Foundation

Only these tasks.

Do not implement NPCs.

Do not implement dialogue.

Do not implement BeatController.

Do not implement combat.

Do not implement portals.

---

PART 1 — STAGE MODEL

Create a temporary StageData structure.

Hardcoded is acceptable.

Example:

StageData {
id
name
width
height
spawnPoint
obstacles[]
}

This is temporary.

Future YAML loading will replace it.

Design it so migration is easy.

---

PART 2 — WORLD GENERATION

Replace the empty debug world.

Create a simple prototype village.

Using primitive graphics only:

* grass area
* paths
* buildings
* fences
* rocks
* trees

No assets required.

Graphics API is acceptable.

Simple coloured rectangles are acceptable.

Goal:

The world should visually communicate:

"This is a place."

Not:

"This is a debug map."

---

PART 3 — COLLISION

Player must collide with:

* buildings
* trees
* rocks
* fences

Requirements:

* no clipping
* no tunneling
* smooth movement

Use Phaser collision systems.

No custom physics.

---

PART 4 — STAGE SPAWN

Player must spawn from:

StageData.spawnPoint

not from hardcoded centre.

---

PART 5 — DEBUG TOOLS

Keep existing debug overlay.

Add:

Current Stage Name

World Size

Optional:

Toggle collision debug key

---

OUT OF SCOPE

No NPCs

No interaction

No dialogue

No quests

No knowledge panels

No BeatController

No Zustand

No save system

No content loading

No portals

No enemies

No combat

---

ACCEPTANCE CRITERIA

1. StageData object exists.
2. Stage loads from StageData.
3. World looks like a small village.
4. Obstacles exist.
5. Player collides correctly.
6. Spawn point comes from StageData.
7. Camera still works.
8. Existing movement still works.
9. TypeScript passes.
10. No console errors.

---

DELIVERABLES

Files created

Files modified

Architecture notes

How to test

Known limitations

Screenshot request

Stop after T-04 and T-05.

Do not begin NPC implementation.
