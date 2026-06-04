# Definition of Done

> **Milestone:** 04 — Vertical Slice
> **Purpose:** Precise, observable conditions that define when the vertical slice is complete. Not subjective. Each criterion is a pass/fail test.

---

## The vertical slice is complete when ALL of the following pass.

---

### Technical completeness

**TC-01** — The game loads on the `/game` route without server-side errors, console errors, or React hydration warnings.

**TC-02** — All 9 beats of Stage 2 can be completed in a single session without crashes, deadlocks, or broken state.

**TC-03** — Death and retry work at every combat encounter: player HP reaches 0 → death screen → retry → combat resumes at encounter start with hint visible.

**TC-04** — `progressState` persists to localStorage: discovered scrolls, mastery flags, and completed beats survive a page refresh.

**TC-05** — `sessionState` (HP, current combat) does NOT persist: HP resets to max on page refresh.

**TC-06** — Mira's dialogue state changes after boss defeat (home broken → home restored) and the change is visible to the player without interaction.

**TC-07** — The PORTAL beat fires correctly after all preceding beats complete and transitions to a "Stage 3 — Coming Soon" screen.

**TC-08** — No beat can fire out of sequence: Beat 6 (Dungeon) cannot trigger before Beat 4 (Combat) occurs; Beat 7 (Boss) cannot trigger before Beat 6 completes.

---

### Knowledge delivery

**KD-01** — A first-time player (no Kubernetes knowledge) can explain what a Pod is in their own words, unprompted, within 5 minutes of completing the slice.

**KD-02** — The three knowledge scrolls are all findable and readable without walkthrough assistance.

**KD-03** — The `progressState.masteryEncountered` flag for `concept:kubernetes:pod` is set after the first scroll is read.

**KD-04** — The `progressState.masteryDemonstrated` flag for `concept:kubernetes:pod` is set after the first enemy is defeated.

---

### Combat loop

**CL-01** — The charge meter is visible during combat and rises visibly after a correct answer.

**CL-02** — Correct answer → full charge (3 correct) → ability animation fires in Phaser canvas.

**CL-03** — Incorrect answer → hint text appears on the next attempt (not a generic "wrong" message — a specific hint about the Pod concept).

**CL-04** — The ChallengeRenderer panel does NOT look like a quiz. Shown to a neutral observer cold, it is described as a "game UI element" rather than a "form" or "test."

---

### Boss fight

**BF-01** — The Pod Tyrant fight has two distinct phases, each using a different question type.

**BF-02** — The phase transition is visually observable (colour change + brief UI indicator).

**BF-03** — A player who answers Phase 2 incorrectly receives a hint about Pod boundaries (not generic feedback).

**BF-04** — Boss defeat triggers Mira's home change, Kestran's appearance, and portal activation within 2 seconds.

---

### Emotional criteria

**EC-01** — At least 2 of 3 internal playtesters mention Mira's home or Mira by name during debrief without being asked about her.

**EC-02** — No playtester uses the words "quiz," "test," "class," or "lesson" to describe any moment in the slice during debrief.

**EC-03** — At least one playtester retries after dying (rather than closing the game). The retry did not require explicit prompting.

**EC-04** — Kestran's silent beat (opening the gate without speaking) reads as characterisation, not a bug. At least 2 of 3 playtesters describe it as intentional.

---

### Pacing

**PC-01** — A first-time playtester completes the full 9-beat sequence in under 60 minutes without walkthrough assistance.

**PC-02** — No playtester reports being stuck for more than 2 minutes without knowing what to do next.

**PC-03** — Beat 6 (Dungeon) takes less than 15 minutes, including Warren Knot. The dungeon does not overstay its welcome.

---

## What is explicitly NOT in the definition of done

These items do not block the vertical slice being "complete":

- Audio (silence or placeholder is acceptable)
- Polished art (placeholder rectangles are acceptable)
- Campaign selection screen
- Player levelling/XP display
- Save slots
- Settings menu
- Stage 1 or Stage 3 content
- Inventory system
- Theme system
- Animation quality (static visuals are acceptable)

---

## Sign-off

The vertical slice is signed off when:

1. All technical completeness criteria (TC-01 through TC-08) pass
2. All knowledge delivery criteria (KD-01 through KD-04) pass
3. All combat loop criteria (CL-01 through CL-04) pass
4. All boss fight criteria (BF-01 through BF-04) pass
5. An internal playtest with at least 2 playtesters validates the emotional criteria (EC-01 through EC-04)
6. Pacing criteria (PC-01 through PC-03) pass

**The emotional criteria are the hardest and most important.** A slice that passes all technical criteria but fails EC-01 (no one cares about Mira) or EC-02 (it feels like a quiz) has failed the fundamental ForgeMinds hypothesis and requires design revision, not more implementation.
