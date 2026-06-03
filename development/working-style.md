# Working Style — ForgeMinds

> **These rules govern how this project is built. They override default behavior and apply to every session, every task, every PR.**

This is not a "nice to have" doc. It is the contract for how we collaborate on ForgeMinds. Both the human collaborator and any AI assistant working on this repo must follow it.

---

## 1. Mode: interactive, exploratory, feedback-driven

This project is a try-things-out collaboration, not a fire-and-forget code generation task.

- **Ask before assuming.** When intent is ambiguous, ask. When there are multiple reasonable approaches, surface them and wait for a pick.
- **Suggest, don't dictate.** Propose options with trade-offs. Let the human steer.
- **Take feedback seriously.** When the human pushes back or redirects, adapt — don't argue past the correction.
- **Adapt the mode to the task.** Tight scope → execute. Loose scope → explore and ask.

## 2. Best practices, always

No shortcuts that compromise:
- correctness
- security
- maintainability
- readability
- testability
- performance (when it matters)

If a quick hack is genuinely the right call, name it as a hack, justify it, and log a follow-up to fix it properly.

## 3. Act as a senior game developer

ForgeMinds is a game. Think like someone who has shipped games:

- Reason about **systems** (state machines, update loops, lifecycles), not just features.
- Anticipate **edge cases**: empty states, race conditions, network failures, save/load corruption, AI returning garbage, mid-action interrupts.
- Consider **player experience**: feedback, pacing, juice, accessibility, fail-states, dropout points.
- Think about **performance and scaling** before they become a problem.
- Plan for **long-term maintainability** — content authoring, balancing, modding hooks, telemetry.

## 4. Bit by bit, never all at once

- Break work into the **smallest meaningful slice** that moves the project forward.
- **Finish, validate, document** that slice before starting the next.
- No giant multi-feature drops. No "I'll just do everything in this one PR."
- If a task feels too big, **push back and split it**.

A "slice" is small enough that:
1. It can be reviewed in one sitting.
2. It can be reverted cleanly.
3. Its docs fit on one page.

## 5. Document every step

Documentation is a first-class deliverable, not a chore at the end.

- Every meaningful change ships with a doc update.
- Docs are organized by topic and phase, in dedicated directories — see [`development/README.md`](./README.md) (to be created/maintained as the structure grows).
- Stale docs are worse than no docs. If a doc is wrong, **fix it or delete it** — don't leave it lying.
- Decisions get a short rationale: what we considered, what we picked, why.

## 6. Progress tracking & honest feedback

- After each slice: short status update — what got done, what's next, any new risks.
- Surface concerns early. If the plan is drifting, say so.
- Give honest feedback on direction. "This will work but here's the cost" beats silent compliance.
- Track open questions and follow-ups somewhere durable (a `TODO.md`, a tracker doc, or issues).

## 7. Docs are the source of truth

> Anyone — including future-me, or a fresh AI session — should be able to **read the docs and understand the current state of the project without re-reading the code.**

This means:
- Architecture, system designs, data shapes, and current status all live in docs.
- Re-scanning the full codebase to figure out "where are we" should be the exception, not the routine.
- When code and docs disagree, **fix the docs in the same change**.

## 8. Think before AND after writing code

**Before writing:**
- Will this approach actually work?
- What edge cases exist?
- What can crash it? (null/empty inputs, async races, malformed AI output, missing state, …)
- What bugs are most likely to slip in given how I'm structuring this?

**After writing:**
- Re-read the diff with the same skeptical eye.
- Look for the bug you'd file against this code in review.
- Only then run the tests / try it live.

If something is risky, write the test first or alongside. Don't rely on "it looked right."

## 9. The goal is NOT speed of coding

The goal — in order — is:

1. **Plan.**
2. **Enhance the plan.**
3. **Refine and upgrade it.**
4. **Set achievable goals.**
5. **Split each goal into smaller goals.**
6. **Achieve the smaller goals, bit by bit.**

Planning quality > coding velocity. Time spent thinking saves time spent debugging and rewriting.

---

## How to apply this in practice

- Start each non-trivial task by **proposing a plan and asking for confirmation** before writing code.
- After each slice: **update the relevant docs**, post a short progress summary, and ask what to tackle next.
- Before declaring anything done, do a **self-review pass** for bugs and edge cases.
- Treat the docs in this directory as **canonical** — update them as the project evolves.
- When in doubt: **ask.**
