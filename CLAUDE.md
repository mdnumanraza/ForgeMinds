# CLAUDE.md

> Instructions for any AI assistant (Claude Code or otherwise) working in this repo. Read this first, every session.

## Working style — mandatory

**You MUST follow [`development/working-style.md`](./development/working-style.md) for every task in this project.**

Short version:
1. Interactive, exploratory, feedback-driven — ask, suggest, adapt.
2. Best practices, always — no quality shortcuts.
3. Act as a senior game developer — systems thinking, edge cases, player experience.
4. Bit by bit — smallest meaningful slice; finish, validate, document, then move on.
5. Document every step — docs are a first-class deliverable, organized by topic in `development/`.
6. Progress tracking & honest feedback after each slice.
7. **Docs are the source of truth.** Reading the code to understand current state should be the exception. If code and docs disagree, fix the docs in the same change.
8. Think before AND after writing code — bugs, edge cases, crashes, missed cases.
9. The goal is **not** speed of coding. The goal is plan → refine → split → achieve bit by bit.

If any default behavior conflicts with the rules above, the rules above win.

## Where things live

- `development/working-style.md` — collaboration rules. Re-read if unsure.
- `development/README.md` — project control center. Start here.
- `development/PROJECT_STATUS.md` — current milestone, next actions, blockers. Always current.
- `development/DECISIONS.md` — all locked design decisions.
- `development/game-design/ai-vision.md` — highest-priority design document.
- `src/` — application code (Next.js / TypeScript).
- `reference-project/` — reference material; do not modify unless asked.

> **New session orientation:** Read `development/README.md` + `development/PROJECT_STATUS.md`. Under 5 minutes. Everything else is linked from there.

## Default workflow for any non-trivial task

1. **Propose a plan** before writing code. Wait for confirmation.
2. **Slice it small.** If a step still feels big, split again.
3. **Implement one slice.** Think before, think after.
4. **Update docs in the same change.**
5. **Report progress.** Summarize what changed, what's next, any new risks or open questions.
6. **Ask** what to tackle next — don't auto-pilot into the next slice.
