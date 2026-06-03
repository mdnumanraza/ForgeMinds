# Quest System

> **Purpose:** How quests deliver story, learning beats, and pacing.
> **Status:** Preliminary stub — not yet finalized. Real design happens in Milestone 01 (Game Discovery) and Milestone 03 (Design Decisions).
> **Owned by:** AI

## Preliminary description

Quests are the connective tissue between exploration, encounters, and concepts — they give the player a reason to be somewhere doing something, and they are where most learning beats will likely be staged. We will decide whether quests are tightly authored (Zelda-style set pieces), loosely structured (Pokémon-style "go talk to person, then route opens"), or a mix of mainline arcs and short side quests with their own rhythm. Candidates include critical-path quests that gate stage advancement, optional knowledge-deepening side quests, and ambient micro-quests surfaced through dialogue or environmental cues. A central design question is how a quest expresses its learning intent without becoming a thinly-veiled exercise — the goal must feel diegetic ("the village's water is unbalanced because the scheduler is overwhelmed") rather than scholastic. We also need to think about quest legibility: how the player tracks objectives, how hints escalate, and how failure or stuck states are handled gracefully.

## Open questions

- Are quests primarily mainline, side, or layered?
- How is a quest's learning intent hidden inside its fiction?
- Should quests have explicit objective trackers, or rely on dialogue memory?
- What happens when a player gets stuck — escalating hints, skip option, or both?
- How do quests interact with bosses and stage gating?

## TODO

- [ ] Define quest types (mainline, side, ambient, repeatable) and ratios
- [ ] Sketch one example quest end-to-end for one stage
- [ ] Decide on objective-tracking UX (journal, in-dialogue, none)
- [ ] Plan hint-escalation pattern for stuck players
- [ ] Map how quests trigger and feed knowledge beats

## Related

- [[ai-dialogue-system]]
- [[ai-knowledge-system]]
- [[ai-campaign-structure]]
- [[ai-boss-system]]
