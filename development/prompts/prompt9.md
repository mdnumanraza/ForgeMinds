# FORGEMINDS — EXECUTE PHASE 2.3

Phase 2.2 is approved.

Proceed with:

Phase 2.3 — Quest + NPC + CastMember Model

Objective:

Design the conceptual architecture for:

* Quests
* NPCs
* CastMembers
* Dialogue Ownership

Focus on:

Responsibilities
Ownership
Lifecycle
Relationships
Reuse

Not implementation.

---

Important questions to answer:

1. What is a Quest?

2. Why does a Quest exist?

3. What responsibilities belong to a Quest?

4. What responsibilities do NOT belong to a Quest?

5. What is an NPC?

6. What is a CastMember?

7. Why are they different?

8. Can an NPC exist without a Quest?

9. Can a Quest exist without an NPC?

10. Can a Quest span multiple Stages?

11. How should recurring characters be represented?

12. How should Stage-local characters be represented?

13. Who owns dialogue?

14. Who triggers dialogue?

15. Who controls dialogue progression?

---

Required Deliverables:

* Quest Model
* NPC Model
* CastMember Model
* Dialogue Ownership Model
* Ownership Matrix
* Dependency Matrix
* Lifecycle Matrix
* Reuse Rules
* Validation Rules

---

Constraints:

Do NOT create schemas.

Do NOT create JSON.

Do NOT create TypeScript.

Do NOT design storage.

Do NOT choose YAML vs JSON.

Stay conceptual.

---

Special Focus:

Ensure recurring characters such as:

* Mira
* Kestran
* Lyra
* Voss

can evolve across an entire campaign without becoming tied to individual quests.

The architecture should support both:

* story-driven quests
* learning-driven quests

without creating duplicate systems.

Update PROJECT_STATUS.md when complete.

Stop after Phase 2.3.
