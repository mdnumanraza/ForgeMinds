# Game Discovery Overview

> **Purpose:** Frame the game discovery phase and its outputs.
> **Status:** Stub — not yet detailed.
> **Owned by:** AI

## TODO

- [ ] Summarize what game discovery covers
- [ ] List the docs in this folder and their purpose
- [ ] Define entry and exit criteria for this phase
- [ ] Link to vision review handoff

---

## Open tensions to resolve before Milestone 03

These three cross-cutting design tensions surfaced while drafting the preliminary game-design stubs in [`../game-design/`](../game-design/). They are flagged here at the top of Game Discovery so they are visible *before* Milestone 03 (Design Decisions) tries to lock anything. Each one cuts across multiple systems — resolving them piecemeal will produce inconsistent UX. We need a single coherent stance on each.

> **Update:** `prompts/prompt2.md` was provided as a v1 design proposal and resolves Tensions 1 and 2. Status updated below. Tension 3 remains open. The resolutions are recorded in [`../game-design/ai-gameplay-loop.md`](../game-design/ai-gameplay-loop.md) and will be formalized as ADRs in [`../02-design-decisions/`](../02-design-decisions/) when Milestone 03 runs.

1. **Knowledge-as-mechanic vs. knowledge-as-narrative coupling.** ✅ **Resolved by prompt2.md → ai-gameplay-loop.md.**
   Decision: knowledge-as-mechanic. Understanding a Kubernetes concept directly affects what the player can do — combat charge thresholds, ability activation, doors that open, quests that branch. Knowledge is not a separate stat; it is the substrate that powers the gameplay verbs. Cascades into Progression, Reward, Enemy, Boss are now constrained by this stance.

2. **Mastery detection without quiz aesthetics.** ⚠️ **Partially resolved by prompt2.md → ai-gameplay-loop.md.**
   Decision on *form*: deterministic challenges only (MCQ, command completion, code recognition, scenario, debugging, matching, ordering) — no essays, no subjective answers. Decision on *aesthetic*: still a live design challenge. The risk that "combat = MCQ with sword animation" makes the game feel like a quiz with skin is now an explicit pacing rule (`ai-gameplay-loop.md` §6) and will be addressed in the upcoming weaknesses / fun-factor / combat-recommendations slices. Treat this tension as "form locked, feel still open."

3. **Returning-expert vs. under-prepared player.** 🟡 **Still open.**
   Prompt2.md does not address how an experienced Kubernetes user experiences Stage 1 (Containers/Pods), nor how a struggling player escalates out of being stuck. Candidate stances (skip-out, optional speedrun, acknowledged-but-still-played, hint escalation, alternate quest paths, difficulty scaling) need to be enumerated and one picked. Sharpen in Milestone 01 Phase 1.6, decide in Milestone 03.

These do not need to be answered in Milestone 01 itself. They need to be **named, framed, and tracked** here so Milestone 03 walks in with the questions already sharpened.
