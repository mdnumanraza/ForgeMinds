# DECISIONS

> ADR-style log of all locked project decisions. Each entry is permanent — decisions are superseded (with a new entry), never deleted.
> For open tensions (not yet decided), see `discovery/open-tensions.md`.

---

## How to read this

- **Locked** — decision is final for this version; changing it requires a new entry + version bump on affected docs
- **Superseded** — an earlier decision was replaced; both entries are kept for history
- **Under review** — tentatively locked, pending confirmation

---

| # | Decision | Status | Date | Reason |
|---|---|---|---|---|
| D-01 | ForgeMinds is a story-driven RPG where players learn technical domains through gameplay, not quizzes | Locked | 2026-06-03 | Core product vision; see `game-design/ai-vision.md §1` |
| D-02 | Knowledge-as-mechanic: understanding directly powers gameplay verbs (combat, traversal, quests, dialogue) | Locked | 2026-06-03 | Resolves Tension 1; see `game-design/ai-vision.md §5` |
| D-03 | Player fantasy: summoned learner with capacity-to-learn; knowledge rarity is environmental (kingdom lost it), not personal | Locked | 2026-06-03 | Corrected from "chosen mastery"; see `game-design/ai-vision.md §2` |
| D-04 | Primary target emotion: comprehension click ("oh, *that's* how it works") | Locked | 2026-06-03 | Five target emotions defined; click is primary; see `game-design/ai-vision.md §3` |
| D-05 | Four design pillars: Knowledge is the verb · The world remembers · Failure teaches, never punishes · Adventure first, lesson second | Locked | 2026-06-03 | See `game-design/ai-vision.md §4` |
| D-06 | Challenge forms are deterministic only: MCQ, command completion, code recognition, scenario, debugging, matching, ordering | Locked | 2026-06-03 | Resolves Tension 2 (form); feel still open; see `game-design/ai-gameplay-loop.md §1c` |
| D-07 | Three-scale gameplay loop: moment-to-moment · session · stage-arc | Locked | 2026-06-03 | See `game-design/ai-gameplay-loop.md` |
| D-08 | Soft failure model: HP loss on wrong answer, retry-friendly, knowledge state never erased on death | Locked | 2026-06-03 | Pillar 3; see `game-design/ai-vision.md §4` and `ai-gameplay-loop.md §5` |
| D-09 | Stage arc: 9 beats (Arrival → Exploration → Discovery → Quests → Encounters → Mini-challenges → Dungeon → Boss → Portal) | Locked | 2026-06-03 | See `game-design/ai-gameplay-loop.md §3` |
| D-10 | Kubernetes Kingdom campaign: 13 mandatory stages + Final Stage + 3 expandable optional regions | Locked | 2026-06-03 | See `game-design/ai-campaign-structure.md` |
| D-11 | Three acts: Fundamentals (1–4) · Orchestration (5–9) · Mastery (10–13) + Final Reckoning | Locked | 2026-06-03 | See `game-design/ai-campaign-structure.md §Act map` |
| D-12 | Khaosynth motivation: witnessed repeated failure, concluded failure must be eliminated through total control — tragic philosopher, not villain | Locked | 2026-06-03 | Thematic coherence with Kubernetes philosophy (design for recovery, not for perfection) |
| D-13 | Progression is per-campaign; no cross-game progression | Locked | 2026-06-03 | Each kingdom is a self-contained arc; cross-game progression dilutes per-kingdom narrative |
| D-14 | Two themes: Fantasy Kingdom + Space Galaxy; same learning content, different visual/story skin | Locked | 2026-06-03 | Theming is a skin, not a fork; content schema must support both |
| D-15 | Bosses combine concepts from the stage/act; they do not introduce new concepts | Locked | 2026-06-03 | Bosses validate mastery; teaching is done before the boss, not by the boss |
| D-16 | 15 milestones in planning order: Discovery → Architecture → Design → Content → Assets → Core → Navigation → NPCs → Quests → Learning → Enemies → Bosses → Save → Theme → Polish | Locked | 2026-06-03 | See `milestones/ai-master-roadmap.md` |

---

## Pending decisions (to be locked in Milestone 03)

- **Tension 3:** Returning-expert vs. under-prepared player handling — see `discovery/open-tensions.md`
- **Tension 2 (feel):** Full mastery-without-quiz-aesthetics solution — see `discovery/open-tensions.md`
- **World structure:** Linear vs. hub-and-spoke vs. critical-path+optional — partially resolved by campaign design; formal ADR pending
