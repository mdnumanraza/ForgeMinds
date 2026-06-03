# Inventory System

> **Purpose:** What items the player holds, what they do, and how inventory interacts with progression.
> **Status:** Preliminary stub — not yet finalized. Real design happens in Milestone 01 (Game Discovery) and Milestone 03 (Design Decisions).
> **Owned by:** AI

## Preliminary description

Inventory is a deceptively load-bearing system: it shapes what rewards mean, what the player can express in encounters, and how persistent the world feels. We will decide whether inventory is full RPG-style (consumables, equipment, key items, currency, and a codex), Zelda-style (tools-as-progression with no consumables to speak of), or something pared down to fit a teaching-first game where every item carries semantic weight. Candidates include a small, hand-curated tool set where each item maps to a Kubernetes concept, a richer JRPG inventory with stat-bearing equipment, and a hybrid where consumables are minor flavor and the meaningful items are concept-tools. A central tension is item bloat: in a game about clarity, an inventory cluttered with low-meaning loot would actively undermine the experience. We will also need to decide how inventory persists across stages, whether items can be lost, sold, or upgraded, and how the UI presents items so they remain readable rather than overwhelming.

## Open questions

- How rich is the inventory — minimal, classic JRPG, or hybrid?
- Are most items meaningful tools, or is there room for flavor loot?
- Can items be sold, upgraded, or lost?
- How does inventory presentation stay readable as it grows?
- Do key items map directly to learned concepts?

## TODO

- [ ] Decide on inventory scope and category list
- [ ] Sketch a minimal viable inventory for stage 1
- [ ] Define UI principles for inventory readability
- [ ] Decide whether an upgrade or crafting layer exists
- [ ] Map candidate key items to early Kubernetes concepts

## Related

- [[ai-reward-system]]
- [[ai-progression]]
- [[ai-knowledge-system]]
- Milestone 03 — Design Decisions
