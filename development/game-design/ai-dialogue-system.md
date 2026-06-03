# Dialogue System

> **Purpose:** How NPC conversations carry voice, story, hints, and learning.
> **Status:** Preliminary stub — not yet finalized. Real design happens in Milestone 01 (Game Discovery) and Milestone 03 (Design Decisions).
> **Owned by:** AI

## Preliminary description

Dialogue is one of the most efficient delivery vehicles for everything ForgeMinds wants to do at once: world-building, character, hints, quest framing, and gentle pedagogy. We will decide whether dialogue is purely scripted (Pokémon/Zelda-style fixed lines), branching with player choice (JRPG-style), or augmented with dynamic responses driven by player state — and how much, if any, generative AI sits behind that surface. Candidates include classic top-down textboxes with portraits, branching trees with persistent NPC memory across stages, and Golden Sun-style party-banter that comments on context. A central concern is voice: NPCs should feel like inhabitants of a world, not narrators of a tutorial — a guard at the Pod Gate should grumble about overcrowding, not explain replica counts. We also need to think about hint escalation (when a player is stuck, NPC dialogue should soften toward help without breaking immersion) and how dialogue links into quests, knowledge introductions, and reward delivery.

## Open questions

- Scripted, branching, or partially generative dialogue?
- Do NPCs remember prior interactions, and if so, how broadly?
- How do we keep teaching tone out of NPC voice while still delivering concepts?
- How do hints escalate within dialogue without breaking immersion?
- Is there a party / companion banter layer, or only world NPCs?

## TODO

- [ ] Decide on dialogue structure (linear vs. branching vs. dynamic)
- [ ] Draft 2–3 NPC voice samples to set the tone bar
- [ ] Define how dialogue triggers and tracks quest state
- [ ] Plan hint-escalation patterns inside conversations
- [ ] Decide whether companion banter exists in scope

## Related

- [[ai-quest-system]]
- [[ai-knowledge-system]]
- [[ai-vision]]
- Milestone 03 — Design Decisions
