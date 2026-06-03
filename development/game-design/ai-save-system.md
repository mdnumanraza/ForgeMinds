# Save System (game-design view)

> **Purpose:** What the player perceives about saving, autosave, and continuity (technical save design lives in Milestone 13).
> **Status:** Preliminary stub — not yet finalized. Real design happens in Milestone 01 (Game Discovery) and Milestone 03 (Design Decisions).
> **Owned by:** AI

## Preliminary description

This stub is strictly about the player-facing experience of saving — the felt sense of continuity, safety, and place — not about persistence layers, schemas, or sync (those live in the technical save design later). We will decide whether saving is explicit (Pokémon-style "press save in the menu"), Zelda-style room-to-room autosave, JRPG save-point landmarks, or something hybrid that pairs autosave with player-controlled named slots. Candidates include single-slot autosave for simplicity, multi-slot for experimentation, and a "campfire" diegetic save spot that doubles as a rest/reflection beat. A core question is what the player sees when they return: do they resume mid-step, at the last safe location, or at the start of the current quest? Equally important is failure-state framing — when something goes wrong the player must never feel they have lost progress, and the trust contract around saving is a meaningful part of the felt quality of the game.

## Open questions

- Autosave, manual save, save points, or hybrid?
- Single-slot or multi-slot from the player's perspective?
- Where exactly does the player resume on return?
- Should there be a diegetic save moment (campfire, inn, terminal)?
- How do we communicate "your progress is safe" without a UI nag?

## TODO

- [ ] Decide save model from a player-experience standpoint
- [ ] Sketch the resume-on-return experience for typical interruption points
- [ ] Decide on diegetic save-spot fiction (or absence of one)
- [ ] Plan messaging when a save event occurs
- [ ] Hand off perceived-behavior contract to Milestone 13 (technical save)

## Related

- [[ai-gameplay-loop]]
- [[ai-campaign-structure]]
- Milestone 13 — Technical Save Design
- Milestone 03 — Design Decisions
