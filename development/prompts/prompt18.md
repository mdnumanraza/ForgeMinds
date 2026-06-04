# FORGEMINDS — T-02 + T-03 IMPLEMENTATION

Context

T-01 is complete and approved.

Current state:

BootScene
↓
PreloaderScene
↓
StageRuntimeScene

renders a Phaser canvas successfully.

Architecture remains:

React
↓
PhaserGame
↓
BootScene
↓
PreloaderScene
↓
StageRuntimeScene

Do not introduce new architecture.

Do not introduce systems unrelated to movement.

---

Objective

Implement:

T-02 Player Movement

and

T-03 Camera Follow

only.

---

Requirements

Player

Create a temporary player entity.

Placeholder only.

No sprite assets required.

Use:

* coloured rectangle
  or
* generated graphics texture

Player must:

* spawn in centre of world
* move using WASD
* move using arrow keys

Movement must:

* be framerate independent
* use delta time
* feel responsive

---

World

Create a world larger than the viewport.

Example:

2000x2000

The player must be able to move around it.

World boundaries must exist.

Player cannot leave world bounds.

---

Camera

Camera follows player.

Requirements:

* smooth follow
* world bounds respected
* no visible jitter
* player remains visible

---

Debug Overlay

Temporarily render:

Player Position

Camera Position

FPS

in a small corner.

This is development-only.

Keep implementation simple.

---

Out Of Scope

No tilemap

No collisions

No NPCs

No quests

No dialogue

No BeatController

No Zustand

No save system

No content loading

No combat

No portals

No YAML

No Blueprint integration

---

Acceptance Criteria

1. Player appears in world.
2. WASD works.
3. Arrow keys work.
4. Camera follows player.
5. World larger than viewport.
6. Player cannot leave bounds.
7. No console errors.
8. No memory leaks.
9. HMR still works.
10. TypeScript passes.

---

Deliverables

Code

Files created

Files modified

How to test

Known issues

Screenshot request

Stop after T-02 and T-03.

Do not begin T-04.
