# Content Authoring Workflow Examples

> **Phase:** 2.6.5 — Content Authoring Architecture
> **Purpose:** Concrete workflow walkthroughs for the most common authoring tasks under Hybrid E3 (the recommended architecture). Answers: "What does a content designer actually do to accomplish X?"
> **Status:** v1 — uses E3 (Dual-Layer Campaign Skeleton + Stage Detail) as the authoring model.
> **Owned by:** AI

---

## Reference: E3 directory structure

```
campaigns/
└── kubernetes-kingdom/
    ├── campaign.yaml
    ├── cast/
    │   ├── lyra.yaml
    │   ├── kestran.yaml
    │   ├── voss.yaml
    │   ├── mira.yaml
    │   └── khaosynth.yaml
    └── stages/
        ├── stage-01-hollow-fields.yaml
        ├── stage-02-podveil-village.yaml
        ├── ...
        └── stage-14-dragons-throne.yaml
```

---

## Task 1 — Create a new stage

**Scenario:** Design Ingress Fortress (Stage 10 — Ingress concept).

**Files touched:** 2 — `campaign.yaml` (update), `stages/stage-10-gateway-spires.yaml` (create)

**Workflow:**

1. Open `campaign.yaml`
   - Add `stage-10-gateway-spires` to Act 3's stage list at the correct position
   - Add `concept:kubernetes:ingress` to the Campaign's referenced concepts (if not already there)
   - Save

2. Create `stages/stage-10-gateway-spires.yaml`
   - Set metadata: title, conceptRef, levelRange
   - Author the beat sequence inline:
     ```
     beats:
       - position: 1, type: ARRIVAL, payload: { title: "...", description: "..." }
       - position: 2, type: EXPLORATION, payload: { title: "...", region: { ... } }
       - position: 3, type: KNOWLEDGE, payload: { title: "...", conceptRef: "concept:kubernetes:ingress", ... }
       - ... (continuing through all beats)
       - position: N, type: PORTAL, payload: { title: "...", nextStageRef: "stage-11-helm-citadel" }
     ```
   - Reference cast members appearing in this stage via AppearanceTriggers
   - Save

3. Open Blueprint Viewer (`/tools/blueprints`) — Stage 10 appears in the Campaign View. Click to verify beat sequence in Stage View.

4. Validation runs automatically — any missing KNOWLEDGE beats, ordering errors, or Boss concept gaps surface as warnings.

**Complexity: Low.** Two files. The stage file is the author's complete workspace for this stage.

**AI generation version:**
- Prompt: "Generate stage-10-gateway-spires.yaml for Kubernetes Kingdom. Concept: Ingress. Level range: 27–30. Include 5 knowledge beats, 2 encounter beats, 1 dungeon beat, 1 boss beat, 1 portal beat. Boss must combine Ingress and Networking concepts."
- Output: One stage file. Drop into `stages/`. Update `campaign.yaml` stage list. Done.

---

## Task 2 — Add a new NPC to an existing stage

**Scenario:** Stage 10 needs a new local NPC: Wren, the Gate Warden.

**Files touched:** 1 — `stages/stage-10-gateway-spires.yaml`

**Workflow:**

1. Open `stages/stage-10-gateway-spires.yaml`
2. Find the NPC_INTERACTION beat (or add one if not present)
3. Add Wren's payload inline in the beat:
   ```
   - position: 4, type: NPC_INTERACTION, payload:
       title: "Wren the Gate Warden"
       role: "quest-giver, Ingress knowledge source"
       personality: "Technically meticulous, visibly relieved"
       questHook: "quest:stage-10:wren-open-the-spires"
       dialogueStates:
         pre-quest: "The gate has been sealed since the attack..."
         mid-quest: "You know what you're handling. Please be careful."
         post-quest: "It feels like breathing again."
   ```
4. Save. Blueprint Viewer shows the NPC beat. Validation checks dialogue state completeness.

**Complexity: Minimal.** One file, one beat payload edit.

**Note on recurring NPCs:** Wren is stage-local — her definition lives entirely in the stage file. If a future design decides Wren should appear in multiple stages, she is promoted to a CastMember: create `cast/wren.yaml`, update her stage appearances there, remove the inline definition from the stage file.

---

## Task 3 — Modify a boss

**Scenario:** The Pod Tyrant (Stage 2 boss) needs its mechanic concept updated: the fight now also tests Containers knowledge in a Phase 1.

**Files touched:** 1 — `stages/stage-02-podveil-village.yaml`

**Workflow:**

1. Open `stages/stage-02-podveil-village.yaml`
2. Find the BOSS beat (position 10)
3. Update `conceptsRequired` to include `concept:kubernetes:container`
4. Add a Phase 1 entry:
   ```
   phases:
     - phaseNumber: 1
       conceptRef: "concept:kubernetes:container"
       description: "Absorption phase — the Tyrant consumes containers..."
       resolutionCondition: DAMAGE_HP_ZERO
     - phaseNumber: 2
       conceptRef: "concept:kubernetes:pod"
       description: "Boundary collapse phase..."
       resolutionCondition: CORRECT_ANSWER_PRESENTED
   ```
5. Save. Validation runs: checks that `concept:kubernetes:container` appears in a KNOWLEDGE beat earlier in the stage (it does — beat positions 3 and 4). Passes.

**Complexity: Minimal.** One file, one beat payload edit. Validation confirms prerequisites are met.

---

## Task 4 — Add a knowledge discovery (KnowledgeBeat)

**Scenario:** Stage 7 (Volumes) needs a fourth KNOWLEDGE beat about emptyDir vs PersistentVolumeClaim.

**Files touched:** 1 — `stages/stage-07-sunken-volumes.yaml`

**Workflow:**

1. Open `stages/stage-07-sunken-volumes.yaml`
2. Add a new KNOWLEDGE beat at position 6.5 (or renumber existing beats to create a gap):
   ```
   - position: 6, type: KNOWLEDGE, payload:
       title: "emptyDir vs PersistentVolumeClaim"
       conceptRef: "concept:kubernetes:volume"
       learningGoal: "Distinguish temporary shared storage from persistent storage"
       panel:
         body: "emptyDir lives as long as the Pod — gone when the Pod dies..."
         example: "Two containers in a Pod sharing a temp cache"
         practicalNote: "emptyDir is great for inter-container communication; not for persistence"
   ```
3. Renumber subsequent beats if needed (positions must be unique and ordered)
4. Save. Validation confirms knowledge density has increased.

**Complexity: Minimal.** One file addition. Position management is the only fiddly part — tooling (Blueprint Viewer's future edit mode) will handle renumbering automatically.

---

## Task 5 — Add a challenge question to a boss

**Scenario:** Under D-CA-06 Option B (Concept Pool), add a new MCQ challenge for `concept:kubernetes:pod` at INTERMEDIATE difficulty.

**Files touched:** 1 (Option B) — the concept's ChallengePool definition at platform level

*(Under Option A — Embedded — the stage file itself is touched.)*

**Workflow (Option B — Concept Pool):**

1. Open `concepts/kubernetes/pod.yaml` (platform-level Concept definition)
2. Add a new Challenge to the pod concept's pool:
   ```
   challenges:
     - id: "challenge:pod:mcq:intermediate:003"
       type: MCQ
       difficulty: INTERMEDIATE
       conceptRef: "concept:kubernetes:pod"
       prompt: "A Pod has two containers. Container A fails. What happens?"
       correctAnswer: "The Pod continues running; only Container A restarts"
       distractors:
         - "The entire Pod restarts"
         - "Both containers are evicted"
         - "The Node is drained"
       hintText: "Pods are designed for recovery — container failure is contained."
   ```
3. Save. The challenge is now available to any enemy, boss, or mini-challenge that references `concept:kubernetes:pod`.

**Under Option A (Embedded):** Open the boss or enemy beat in the stage file. Add the challenge inline in the beat payload. One stage file, one challenge added. Higher duplication, simpler lookup.

**Complexity: Minimal in both cases.** The D-CA-06 decision changes where the challenge lives, not how hard it is to add.

---

## Task 6 — Add a campaign-scoped side quest

**Scenario:** Add a side quest that spans Stages 2, 5, and 10 — the player helps Mira across the whole campaign.

**Files touched:** 3–4 — `campaign.yaml`, `stages/stage-02.yaml`, `stages/stage-05.yaml`, `stages/stage-10.yaml`

**Workflow:**

1. Open `campaign.yaml`
   - Add the campaign-scoped quest:
     ```
     campaignQuests:
       - id: "quest:mira-arc"
         scope: CAMPAIGN
         title: "Mira's Journey"
         description: "Follow Mira from her broken home in Podveil to her place as a researcher."
         stages: [stage-02, stage-05, stage-10]
     ```
   - Save

2. Open `stages/stage-02-podveil-village.yaml`
   - Add `referencedCampaignQuests: ["quest:mira-arc"]`
   - Find the QUEST beat for Mira's home — add a step for the campaign quest:
     ```
     campaignQuestStep: { questId: "quest:mira-arc", stepNumber: 1 }
     ```
   - Save

3. Open `stages/stage-05-vault-of-configurations.yaml`
   - Add `referencedCampaignQuests: ["quest:mira-arc"]`
   - Find the relevant beat, add step 2
   - Save

4. Open `stages/stage-10-gateway-spires.yaml`
   - Same pattern, step 3

**Complexity: Moderate.** Four files. This is the most complex common task — but campaign-scoped quests are rare (ForgeMinds has 2–3 per campaign), and the complexity is inherent to the span of the content, not the architecture. The files are isolated and the changes are small.

---

## Task 7 — Create a new campaign

**Scenario:** Create the skeleton for Linux Realms (second ForgeMinds campaign).

**Files touched:** 1 (skeleton phase) — `campaigns/linux-realms/campaign.yaml`

**Workflow (skeleton phase):**

1. Create `campaigns/linux-realms/` directory
2. Create `campaigns/linux-realms/campaign.yaml`:
   ```
   id: "linux-realms"
   title: "Linux Realms"
   domain: "Linux"
   themes: ["fantasy-kingdom", "space-galaxy"]
   cast: []              ← populated as cast is designed
   progressionModel: {}  ← populated when progression is designed
   acts:
     - id: "lr-act-1"
       title: "Act 1 — The Command Line"
       stages:
         - id: "lr-stage-01-the-shell-wastes"   ← placeholder
         - id: "lr-stage-02-the-process-forest"  ← placeholder
   ```
3. Create `campaigns/linux-realms/cast/` (empty initially)
4. Create `campaigns/linux-realms/stages/` (empty initially)

The skeleton exists. The Blueprint Viewer's Campaign View shows the structure immediately. Stage detail files are added one at a time as the campaign is authored.

**AI generation version:**
- Prompt: "Generate a campaign.yaml skeleton for Linux Realms. Domain: Linux. 3 acts. Act 1: Processes, Files, Permissions. Act 2: Users, Scripting, Networking. Act 3: Services, Package Management, Security. Final: The Kernel Reckoning. Use the Kubernetes Kingdom structure as reference."
- Output: One `campaign.yaml`. Drop into `campaigns/linux-realms/`. Begin adding stage files.

**Complexity: Trivial.** One file to create the full campaign structure. Stage authoring begins immediately after.

---

## AI generation workflow summary

How each common generation task fits E3:

| Task | AI output | Target file | Human review |
|---|---|---|---|
| New stage | Complete `stage-N.yaml` with inline beats | Drop into `stages/` | Blueprint Viewer + validation |
| New CastMember | Cast definition + initial StageAppearances | Create `cast/name.yaml` | Cast review + stage appearance review |
| New campaign skeleton | `campaign.yaml` with act/stage structure | Create `campaigns/name/campaign.yaml` | Campaign review |
| Beat sequence for a stage | `beats: Beat[]` section | Paste into existing stage file | Stage View validation |
| Theme variant for a stage | ThemeOverride objects | Append to stage file or dedicated theme section | Visual comparison |
| Challenge questions for a concept | Challenge objects | Append to concept's ChallengePool (Option B) or stage file (Option A) | Validation auto-checks coverage |

In every case: AI generates a bounded, coherent output. The human reviews it in the Blueprint Viewer. Validation catches structural issues. No manual cross-file coordination required.

---

## Cross-references

- `ai-content-authoring-architecture.md` — the full model evaluation and recommendation
- `src/blueprint/data/types.ts` — the TypeScript types the authoring files must produce
- `game-design/ai-campaign-structure.md` — the source of truth for stage content in the mock
