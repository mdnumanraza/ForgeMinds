# Enemy System

> **Purpose:** What enemies represent, how they behave, and how encounters teach.
> **Status:** Preliminary stub — not yet finalized. Real design happens in Milestone 01 (Game Discovery) and Milestone 03 (Design Decisions).
> **Owned by:** AI

## Preliminary description

Enemies are not random hostiles — in Kubernetes Kingdom they are the embodied antagonists of the concepts the player is learning, which means their design carries narrative, mechanical, and pedagogical weight at once. We will decide whether enemies are encountered through random battles (classic JRPG), visible overworld foes (Zelda/Chrono Trigger), or contextual encounters tied to quest beats, and how their behavior reflects the system they personify (e.g., a "Resource-Hog" creature that visibly drains a node-shaped tile). Candidates for combat shape include turn-based parties, real-time skirmishes, and puzzle-encounters where the "fight" is actually a configuration challenge. The deeper question is what makes an encounter feel like progress rather than friction: ideally each enemy archetype teaches or reinforces something specific, and reusing the same archetype later lets the player feel their own growth. Enemy variety, telegraphing, and difficulty pacing across the campaign are open and load-bearing.

## Open questions

- Are encounters random, visible, or quest-gated?
- Is combat turn-based, real-time, puzzle-flavored, or hybrid?
- Does each enemy archetype map to a specific concept or failure mode?
- How do we avoid grinding while preserving the "battle" feel?
- How does enemy difficulty scale with player progression and knowledge?

## TODO

- [ ] List candidate combat models and prototype one on paper
- [ ] Draft a small bestiary tied to early-stage Kubernetes concepts
- [ ] Define telegraphing patterns so behaviors are readable
- [ ] Decide on encounter-trigger rules (random vs. visible)
- [ ] Sketch how enemy reuse signals player growth

## Related

- [[ai-gameplay-loop]]
- [[ai-boss-system]]
- [[ai-knowledge-system]]
- [[ai-progression]]
