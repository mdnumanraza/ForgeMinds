# Risk Register

> **Milestone:** 04 — Vertical Slice
> **Purpose:** Known risks, likelihood, impact, and mitigations.

---

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Phaser + Next.js SSR conflict | High | Blocker | Use `next/dynamic` with `ssr: false` for PhaserGame component. This is Phase A, Task T-01 — solve it on day one. If it fails, nothing else can start. |
| R-02 | ChallengeRenderer looks like a quiz | Medium | Critical | This is the most important aesthetic decision in the slice. Budget extra time for visual treatment. Run the screenshot test before moving to the boss fight. Fail fast — a quiz-looking component at Phase D cannot be ignored. |
| R-03 | BeatController EXPLORATION concurrency is implemented incorrectly | Medium | High | EXPLORATION must not block `advance()`. This is the most architecturally subtle requirement in the controller. Add an explicit test: player can walk around AND interact with a scroll without any blocking wait. |
| R-04 | Mira's emotional anchor fails to land | Medium | High | The emotional criteria are the hardest to verify during development. Schedule an internal playtest after T-18 (NPC content authored) with someone who hasn't read the design docs. Don't wait until Phase F. |
| R-05 | Boss fight feels like three identical questions | Medium | High | The Pod Tyrant's three questions must test genuinely different things: Phase 1 tests "what belongs in a Pod spec," Phase 2 tests "what happens when containers are separated," Phase 3 tests "what makes a Pod healthy." Write these questions before T-28, not during it. |
| R-06 | Phaser tilemap collision is too strict or too loose | Medium | Medium | Players clipping through walls or getting stuck in corners breaks immersion. Test collision thoroughly in Phase A after T-06 with deliberate edge-case movement (diagonal against wall, moving into corner). |
| R-07 | Knowledge questions are too easy (guessable) | Medium | Medium | If all questions have one obviously correct answer and two ridiculous distractors, players never demonstrate understanding — they demonstrate pattern matching. Review all 12 questions: at least two distractors per question should be plausible-but-wrong. |
| R-08 | Session state not resetting correctly between retries | Low | High | After a death and retry, sessionState (HP, combat state) must reset without affecting progressState (mastery, scrolls found). Write a test for this edge case explicitly in T-23. |
| R-09 | localStorage persistence causes state desync after content updates | Low | Medium | If Stage 2 content changes (a scroll gets a new ID), the persisted progressState may reference non-existent IDs. For the vertical slice, add a version key to progressState — if the version doesn't match, clear the state. |
| R-10 | The 60-minute playtest target is wrong | Low | Low | If Stage 2 takes 90 minutes for a first-time player, the pacing needs adjustment (compress dungeon, reduce question count per enemy). Catch this in T-34's internal playtest before scheduling external playtesters. |

---

## Red lines (risks that halt the milestone if discovered)

**R-01 (SSR conflict):** If Phaser cannot be mounted cleanly in Next.js 15 with React 19 using `next/dynamic`, the entire tech stack decision (D-20, D-21) is in question. Do not proceed past Phase A until T-01 passes.

**R-02 (quiz aesthetic):** If the ChallengeRenderer looks like a quiz after Phase D, do not proceed to the boss fight. Fix the visual treatment first. A quiz-looking challenge component in the boss fight will fail the screenshot test and invalidate the slice's primary hypothesis.

**R-04 (Mira fails to land):** If an internal playtest after Phase C reveals no emotional response to Mira, revise her dialogue before building the boss. A boss fight that validates knowledge without emotional payoff tests the wrong thing.
