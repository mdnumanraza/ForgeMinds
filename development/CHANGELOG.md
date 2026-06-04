# CHANGELOG

> Major project decisions and changes only. No implementation details.
> Format: Date | Change | Reason

---

| Date | Change | Reason |
|---|---|---|
| 2026-06-04 | Milestone 02 fully closed; Milestone 03 opened | D-CA-06 (Option B — Concept Pool) and Authoring Format (YAML) approved by human; recorded as D-18 and D-19 |
| 2026-06-04 | Milestone 02 (Content Architecture) conditionally closed | All phases complete; 2 human decisions (D-CA-06, authoring format) required before Milestone 03 opens |
| 2026-06-04 | Phase 2.7 (Theme Variant Architecture) complete | Every content entity classified as TI/TV/TO/TD; 6 rule sets; Kubernetes Galaxy transformation walkthrough |
| 2026-06-04 | Phase 2.6.6 (Authoring Lifecycle) complete | 5 lifecycle states for Campaign/Stage/CastMember/Quest/Beat; AI content requires human REVIEW gate |
| 2026-06-04 | Phase 2.8 (Decision Lock Review) complete | 12 decisions locked; 2 need human input; 6 deferred to later milestones |
| 2026-06-04 | Phase 2.6.5 (Content Authoring Architecture) complete | Hybrid E3 recommended: Campaign Skeleton + Cast files + Stage files |
| 2026-06-04 | Visual Blueprint Viewer built at /tools/blueprints | Proof-of-concept visualisation; Campaign View + Stage View + Beat Detail Panel + 7 validation rules |

---

| Date | Change | Reason |
|---|---|---|
| 2026-06-03 | Documentation refactor — ~107 → ~55 files | Structure had become fragmented; too many planning-stage directories, milestone artifacts, and overlapping files made navigation and maintenance difficult |
| 2026-06-03 | Kubernetes Kingdom campaign design complete (14 stages + Final) | Core campaign content finalized before architecture decisions to ensure technical choices serve the game design |
| 2026-06-03 | Campaign post-review created (20 issues) | Identified Critical/Significant gaps before entering implementation milestones |
| 2026-06-03 | Marketing story files created (`story/` — 4 act files) | Narrative-only version of campaign needed for marketing and non-technical stakeholders |
| 2026-06-03 | Khaosynth motivation revised — enforced perfect order (not knowledge obsession) | Original "wanted knowledge inaccessible" was thematically weak; revised to tragic philosopher who fears adaptation — maps directly to Kubernetes design philosophy |
| 2026-06-03 | Player fantasy corrected — capacity-to-learn, not chosen mastery | Original framing implied pre-selected hero; corrected to "summoned because willing to learn" — knowledge rarity is environmental (kingdom lost it), not personal |
| 2026-06-03 | Stage 9 knowledge density reduced 7→6 | One discovery deferred to Stage 10 callback; player should enter Act 3 confident, not overloaded |
| 2026-06-03 | ConfigMaps/Secrets emotional registers differentiated | Stage 5 = grief for forgotten knowledge; Stage 6 = responsibility for vulnerable knowledge — keeps back-to-back concepts distinct |
| 2026-06-03 | Severed Envoy boss redesigned as 4-phase consequential chain | Original phases were disconnected; redesigned so each phase exposes the next — one system failing, not four separate quiz questions |
| 2026-06-03 | `game-design/ai-vision.md` promoted to canonical project document | Replaces preliminary stub; highest-priority document in project — all future decisions cite it |
| 2026-06-03 | Working style rules saved to project (`working-style.md`) and `CLAUDE.md` | Rules govern all AI collaboration on this project; needed in-repo for any session to load automatically |
