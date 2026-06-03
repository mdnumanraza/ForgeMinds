# Open Design Tensions

> **Purpose:** Track unresolved cross-cutting design tensions. Updated as tensions are resolved or new ones emerge. Tensions are formally decided in Milestone 03 (Design Decisions) and recorded in `DECISIONS.md`.
> **Owned by:** AI + Human

---

## Tension 1 — Knowledge-as-mechanic vs. knowledge-as-narrative

**Status: ✅ Resolved**

**Decision:** Knowledge-as-mechanic. Understanding a Kubernetes concept directly affects what the player can do — combat charge thresholds, ability activation, traversal gates, quests that branch. Knowledge is not a separate stat; it is the substrate that powers the gameplay verbs.

**Recorded in:** `game-design/ai-gameplay-loop.md` §4, `game-design/ai-vision.md` §5

---

## Tension 2 — Mastery detection without quiz aesthetics

**Status: ⚠️ Form locked, feel still open**

**Decision on form:** Deterministic challenges only — MCQ, command completion, code recognition, scenario, debugging, matching, ordering. No essays, no subjective answers.

**Still open:** The feel — ensuring "combat = MCQ with sword animation" does not make the game feel like a quiz with a skin. An explicit pacing rule exists (`game-design/ai-gameplay-loop.md` §6). Full resolution in upcoming weaknesses / fun-factor / combat-recommendations slices, then locked in Milestone 03.

---

## Tension 3 — Returning-expert vs. under-prepared player

**Status: 🟡 Open — to be decided in Milestone 03**

**The question:** How does an experienced Kubernetes user experience Stage 1? How does a struggling player escalate out of being stuck?

**Candidate stances:** skip-out, optional speedrun, acknowledged-but-still-played, hint escalation, alternate quest paths, difficulty scaling.

**Note:** The corrected Player Fantasy (capacity-to-learn, not chosen mastery) makes this less sharp than originally framed — a returning expert is just a learner with a head start. The design space is wider; pacing rather than fantasy reconciliation may be sufficient.

**To be sharpened in:** `milestones/milestone-01-game-discovery/ai-phase-06-tension-handoff.md`
**To be decided in:** Milestone 03

---

## Adding new tensions

When a new cross-cutting design question surfaces, add it here before it becomes a source of per-system inconsistency. Format:

```
## Tension N — Short name
**Status:** Open / Partially resolved / Resolved
**The question:** ...
**Candidate stances:** ...
**To be decided in:** Milestone XX
```
