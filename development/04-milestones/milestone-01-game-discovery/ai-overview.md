# Milestone 01 — Game Discovery

> **Purpose:** Define what ForgeMinds *is*, what it *feels like* to play, *who* it's for, and how we'll know it's working — without locking any system.
> **Status:** Detailed v1. Phases below are stubs to be filled in one at a time.
> **Owned by:** AI

## Goal

Produce a sharp, durable answer to four questions:

1. **What is this game?** (vision)
2. **What does it feel like?** (target feel + reference analysis)
3. **Who is the player?** (player fantasy + audience)
4. **How will we know it's working?** (success criteria)

Plus an explicit list of what we will *not* do (anti-patterns), and a clean handoff of unresolved tensions to Milestone 03.

## Why this milestone exists

Every later milestone — architecture choice, content schemas, asset strategy, system designs — derives its taste and its constraints from what we decide here. If we skip Game Discovery and jump to architecture or systems, we'll make locally-reasonable decisions that drift away from a coherent game. The whole project then has to be retrofitted to a vision we never wrote down.

This milestone exists to make the vision *explicit* and *testable*, so subsequent milestones can be checked against it instead of against intuition.

## What this milestone does NOT do

- **Does not pick a gameplay loop, progression model, world structure, or combat/challenge model.** Those are Milestone 03 (Design Decisions).
- **Does not pick tech, engine, or libraries.** That's Milestone 02 (Architecture Discovery).
- **Does not write content or design assets.** Those are Milestones 04 and 05.
- **Does not define narrative beats or specific stages.** Stage-level design comes after the gameplay loop is chosen.

If a phase below feels like it's drifting toward one of these, it's out of scope — pull it back to vision/feel/player/success.

## Deliverables

The **primary deliverable** of this milestone is a single canonical document:

**`development/game-design/ai-vision.md`** — the Game Vision. Highest-priority design document in the project. Every other doc downstream cites it.

Phase docs (1.1–1.7) are working logs and deepening passes on that canonical doc — they record what each phase added or changed and why, but they do not duplicate its content.

| Phase doc | Role |
|---|---|
| `ai-phase-01-vision.md` | Milestone artifact — records Phase 1.1 produced and blessed `ai-vision.md` v1. ✅ Done. |
| `ai-phase-02-target-feel.md` | Deepening pass on §3 (Target Emotions) + §4 (Pillars) via reference analysis. |
| `ai-phase-03-player-fantasy.md` | Deepening pass on §2 (Player Fantasy). |
| `ai-phase-04-success-criteria.md` | Deepening pass on §6 (Success Criteria). |
| `ai-phase-05-anti-patterns.md` | Deepening pass on §7 (Anti-Patterns). |
| `ai-phase-06-tension-handoff.md` | Sharpens open tensions (§9) into Milestone 03 voting questions. |
| `ai-phase-07-vision-review-handoff.md` | Review packet for the human before Milestone 02 opens. |

**Companion files in `00-game-discovery/`:**
- `ai-target-feel.md`, `ai-player-fantasy.md`, `ai-success-criteria.md` — retired to redirect stubs. Content lives in `ai-vision.md`.
- `ai-reference-games-analysis.md` — kept as an independent artifact (reference analysis is genuinely separate).
- `you-vision-review.md` — human sign-off doc. Required before exit criteria are met.

## Dependencies

**Upstream:** None. This is the first milestone; nothing else has run yet.

**Downstream (this milestone unblocks):**
- Milestone 02 (Architecture Discovery) — needs the vision and feel pillars to evaluate technical options against.
- Milestone 03 (Design Decisions) — needs the three flagged tensions sharpened, the anti-patterns list, and the player fantasy.
- Milestone 14 (Theme Engine) — needs the feel pillars to know what *must* survive across Fantasy and Space themes.

## Risks

1. **Premature lock.** Strongest risk. We'll feel pressure to specify the gameplay loop or progression style inside Game Discovery. *Mitigation:* every phase doc has an explicit "what this phase does NOT decide" section.
2. **Vision-as-marketing.** Producing a polished elevator pitch that *sounds* good but doesn't constrain decisions. *Mitigation:* the elevator-pitch test in Phase 1.1 must produce a paragraph that, when violated, makes a future decision feel obviously wrong.
3. **Reference-tourism.** Listing inspirations as a vibe board instead of extracting concrete pillars. *Mitigation:* reference analysis must produce *what we steal* and *what we reject* from each game, not "we love it because it's nostalgic."
4. **Audience drift.** Trying to serve K8s newcomers and senior engineers equally well in the same campaign. *Mitigation:* one of the three tensions logged in [`../../00-game-discovery/ai-overview.md`](../../00-game-discovery/ai-overview.md). Sharpen, don't try to resolve here.
5. **Anti-patterns becoming a wishlist.** If the anti-patterns list grows to 30 items, none of them carry weight. *Mitigation:* cap at ~10, each with a one-line rationale.

## Exit criteria

This milestone is done when:

- [x] `game-design/ai-vision.md` exists as a real (non-stub) canonical document. ✅
- [ ] All seven phase working logs are completed (not stubs).
- [ ] `ai-reference-games-analysis.md` is filled in (independent artifact, not retired).
- [ ] The three open tensions in `00-game-discovery/ai-overview.md` have been **sharpened** (not resolved) in `ai-phase-06-tension-handoff.md`.
- [ ] `you-vision-review.md` is completed and signed off by the human.
- [ ] Re-read `ai-vision.md` end to end: no section locks a gameplay or architecture decision that belongs in Milestones 02 or 03.

## Phases

The phases below are written in dependency order, not strict execution order. We'll open them one at a time, propose the plan, write the doc, review, then move on.

| # | File | Status | Role |
|---|------|--------|------|
| 1.1 | `ai-phase-01-vision.md` | ✅ Done | Milestone artifact — records `ai-vision.md` v1 was produced here |
| 1.2 | `ai-phase-02-target-feel.md` | Stub | Deepening pass on `ai-vision.md` §3 + §4 via reference analysis |
| 1.3 | `ai-phase-03-player-fantasy.md` | Stub | Deepening pass on `ai-vision.md` §2 |
| 1.4 | `ai-phase-04-success-criteria.md` | Stub | Deepening pass on `ai-vision.md` §6 |
| 1.5 | `ai-phase-05-anti-patterns.md` | Stub | Deepening pass on `ai-vision.md` §7 |
| 1.6 | `ai-phase-06-tension-handoff.md` | Stub | Sharpens `ai-vision.md` §9 tensions into Milestone 03 inputs |
| 1.7 | `ai-phase-07-vision-review-handoff.md` | Stub | Human review packet for `ai-vision.md` before Milestone 02 |

Remaining drafting order: **1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7.**

## Open questions for the human (gathered during this milestone)

> Append items here as they come up. Each question gets resolved in `you-vision-review.md` before exit.

- *(none yet)*
