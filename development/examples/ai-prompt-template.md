# ForgeMinds — AI Prompt Templates

Use these prompts to generate your own `world.json` and `knowledge.json` configuration files using ChatGPT or Claude. Copy the prompt text, paste it into the AI of your choice, and paste the output back into the ForgeMinds Campaign Loader.

---

## World JSON Generation Prompt

Copy this prompt and replace `[TOPIC]`, `[THEME]`, and `[DIFFICULTY]` with your values, then paste into ChatGPT or Claude.

---

```
You are generating a world.json configuration file for ForgeMinds, a JSON-driven RPG learning game engine.

Generate a complete, valid world.json for a learning campaign with the following parameters:
- Topic: [TOPIC]  (e.g. "Linux System Administration", "AWS S3", "Python Basics")
- Theme: [THEME]  (e.g. "ancient-ruins", "space-station", "underwater-base", "cyberpunk-city")
- Difficulty: [DIFFICULTY]  (beginner / intermediate / advanced)

The output must strictly follow this schema:

{
  "$schema": "forgeMinds/world/v1",
  "version": "1.0.0",
  "id": "world-<topic-slug>",               // kebab-case, unique
  "name": "<Creative World Name>",           // thematic, evocative name
  "topic": "<Topic Name>",
  "theme": "<theme-slug>",
  "atmosphere": "<atmosphere-slug>",
  "description": "<2-3 sentence immersive description of the world>",
  "lore": {
    "worldOrigin": "<origin story of this world, 2-3 sentences>",
    "factionName": "<name of the player's faction>",
    "enemyFactionName": "<name of the enemy faction>",
    "coreConflict": "<the central conflict the player must resolve, 2-3 sentences>"
  },
  "visualTheme": {
    "primaryColor": "<hex color matching the theme>",
    "accentColor": "<hex color for highlights>",
    "backgroundGradient": ["<hex1>", "<hex2>", "<hex3>"],
    "particleEffect": "<effect-slug>",
    "ambientSound": "<sound-slug>",
    "fontOverride": null
  },
  "stages": [
    // EXACTLY 5 stages, one per major concept in the topic
    {
      "id": "stage-<concept-slug>",
      "name": "<Stage Name>",
      "order": 1,                            // 1 through 5
      "position": { "x": 100, "y": 500 },   // positions spaced along a path
      "nodeIconKey": "<icon-key>",
      "description": "<1-2 sentence stage description>",
      "unlockCondition": {
        "type": "always"                     // first stage only
        // OR: { "type": "stageComplete", "stageId": "stage-<previous-slug>" }
      },
      "atmosphereOverride": null,            // or a string for the final stage
      "boss": {
        "id": "boss-<unique-slug>",
        "name": "<Creative Boss Name>",      // themed to the concept (e.g. "The Segfault Specter")
        "title": "<Dramatic Subtitle>",
        "description": "<2-3 sentence boss lore, connecting the enemy to the concept>",
        "health": 100,                       // scale: 100-300 (harder stages = more HP)
        "maxHealth": 100,
        "attackPattern": "<attack-slug>",
        "weaknesses": ["<weakness-1>", "<weakness-2>"],
        "defeatCondition": "<plain English condition — what the player must accomplish>",
        "rewardXp": 150,                     // scale with stage difficulty
        "rewardLoot": "<Item Name>",
        "sprite": "boss-<unique-slug>"
      }
    }
    // ... repeat for stages 2-5
  ],
  "npcs": [
    // EXACTLY 2 NPCs: one mentor, one guide
    {
      "id": "npc-<slug>",
      "name": "<NPC Name>",
      "role": "mentor",                      // or "guide"
      "title": "<NPC's Title>",
      "description": "<1-2 sentence NPC description; connect them to the theme>",
      "avatar": "npc-<slug>",
      "dialogueStyle": "<style-slug>",       // e.g. "wise-technical", "terse-helpful"
      "unlockStage": "stage-<first-stage-id>",
      "hintUnlockThreshold": 50,
      "introDialogue": "<First thing the NPC says to the player, in-character>",
      "hintDialogues": [
        "<Hint 1 — a practical tip about the topic>",
        "<Hint 2 — another practical tip>",
        "<Hint 3 — a deeper insight>"
      ]
    }
    // ... second NPC (guide role)
  ],
  "enemies": [
    // 2-3 common enemies (weaker than bosses, appear in multiple stages)
    {
      "id": "enemy-<slug>",
      "name": "<Enemy Name>",
      "description": "<1-2 sentence description; connect to a common error/mistake in the topic>",
      "health": 30,
      "maxHealth": 30,
      "attackType": "<attack-slug>",
      "xpReward": 20,
      "spawnStages": ["stage-<id>", "stage-<id>"],
      "sprite": "enemy-<slug>"
    }
  ],
  "completionReward": {
    "title": "<Completion Title>",
    "description": "<2-3 sentence completion message>",
    "xpBonus": 500,
    "badgeKey": "<topic-slug>-complete"
  }
}

Requirements:
- ALL 5 stages must have unique, creative boss names that are metaphors or personifications of real errors/concepts in [TOPIC]
- The world name, faction names, and lore must be thematically consistent with [THEME]
- Stage positions should form a logical path: increase x from 100 to 900, decrease y from 500 to 100
- Boss health should scale: stage 1 = ~100HP, stage 5 = ~250-300HP
- All IDs must be kebab-case strings
- Do not include any explanatory text outside the JSON — output only the raw JSON object

Generate the world.json now.
```

---

### Example Output (Abbreviated)

```json
{
  "$schema": "forgeMinds/world/v1",
  "version": "1.0.0",
  "id": "world-linux-sysadmin",
  "name": "The Terminal Bastion",
  "topic": "Linux System Administration",
  "theme": "ancient-ruins",
  "atmosphere": "terminal-ruins",
  "description": "Ancient stone walls covered in glowing terminal glyphs...",
  "stages": [
    {
      "id": "stage-filesystem",
      "name": "The File Catacombs",
      "order": 1,
      "boss": {
        "name": "The Permission Wraith",
        "health": 100,
        ...
      }
    }
    ...
  ]
}
```

---

### Validation Checklist

Before using this JSON in ForgeMinds, verify:

- [ ] `id` is unique and kebab-case
- [ ] Exactly 5 stages with `order` 1–5
- [ ] Stage positions increase in X, follow a path
- [ ] First stage has `unlockCondition.type: "always"`
- [ ] All other stages have `unlockCondition.type: "stageComplete"` referencing the previous stage
- [ ] Exactly 2 NPCs: one `mentor`, one `guide`
- [ ] 2–3 enemies with `spawnStages` referencing valid stage IDs
- [ ] `completionReward.badgeKey` is kebab-case
- [ ] No trailing commas, all strings are quoted, all arrays/objects are properly closed

---

## Knowledge JSON Generation Prompt

Copy this prompt and replace `[TOPIC]`, `[WORLD_ID]`, `[DIFFICULTY]`, and `[STAGE_COUNT]` (always 5) with your values.

---

```
You are generating a knowledge.json configuration file for ForgeMinds, a JSON-driven RPG learning game engine.

Generate a complete, valid knowledge.json for a learning campaign with the following parameters:
- Topic: [TOPIC]  (e.g. "Linux System Administration", "AWS S3", "Python Basics")
- World ID: [WORLD_ID]  (must exactly match the "id" field in the corresponding world.json)
- Difficulty: [DIFFICULTY]  (beginner / intermediate / advanced)
- Number of stages: [STAGE_COUNT]  (always 5)

The output must strictly follow this schema:

{
  "$schema": "forgeMinds/knowledge/v1",
  "version": "1.0.0",
  "worldId": "[WORLD_ID]",               // MUST match the world.json id exactly
  "topic": "[TOPIC]",
  "difficultyLevel": "[DIFFICULTY]",
  "estimatedHours": 4,                   // realistic estimate (2–6 hours typical)
  "prerequisiteTopics": [],              // list topic strings if prerequisites exist
  "tags": ["<tag1>", "<tag2>"],
  "stages": [
    // One entry per stage — stage IDs must match the world.json stage IDs exactly
    {
      "stageId": "stage-<concept-slug>",
      "storyIntro": "<2-3 sentence narrative introduction to this stage, in-world voice>",
      "xpReward": 150,                   // total XP for completing the stage (scales with order)
      "bossObjective": "<Plain English — what the player must master to defeat the boss>",
      "concept": {
        "title": "<Concept Title>",
        "summary": "<2-3 sentence overview of what this stage teaches>",
        "chunks": [
          // EXACTLY 3 chunks per stage
          // Chunk 1: conceptual explanation
          {
            "id": "chunk-<slug>",
            "title": "<Chunk Title>",
            "content": "<Clear explanation of the concept, 3-5 sentences>",
            "type": "explanation",
            "keyPoints": [
              "<Key insight 1>",
              "<Key insight 2>",
              "<Key insight 3>",
              "<Key insight 4>"
            ]
          },
          // Chunk 2: code/command example (THE MOST IMPORTANT CHUNK)
          {
            "id": "chunk-<slug>",
            "title": "<Command/Code Title>",
            "content": "<Brief intro to the code example>",
            "type": "code",
            "code": "<actual working code or commands, commented>",
            "language": "<bash|yaml|python|javascript|etc>",
            "keyPoints": [
              "<Explanation of key flag/option/concept in the code>",
              "<Another explanation>",
              "<Another explanation>",
              "<Another explanation>"
            ]
          },
          // Chunk 3: deeper concept or second code example
          {
            "id": "chunk-<slug>",
            "title": "<Title>",
            "content": "<Content>",
            "type": "explanation|code",
            "keyPoints": ["<point1>", "<point2>", "<point3>", "<point4>"]
          }
        ]
      },
      "quest": {
        "id": "quest-<stage-slug>-<number>",
        "title": "<Quest Title — dramatic, in-world>",
        "objective": "<Clear, specific task the player must complete>",
        "description": "<1-2 sentence narrative framing of the quest>",
        "type": "write-and-apply|run-and-verify|explain-and-submit",
        "acceptanceCriteria": [
          "<Specific verifiable criterion 1>",
          "<Specific verifiable criterion 2>",
          "<Specific verifiable criterion 3>"
        ],
        "hints": [
          "<Practical hint 1>",
          "<Practical hint 2>"
        ],
        "xpReward": 75
      },
      "challenge": {
        "id": "challenge-<stage-slug>-mcq",
        "type": "multiple-choice",
        "title": "<Challenge Title>",
        "variants": [
          // EXACTLY 3 variants: easy, medium, hard
          {
            "difficulty": "easy",
            "question": "<Clear, unambiguous question about the concept>",
            "options": [
              { "id": "a", "text": "<Option A>" },
              { "id": "b", "text": "<Option B>", "correct": true },  // exactly one correct
              { "id": "c", "text": "<Option C>" },
              { "id": "d", "text": "<Option D>" }
            ],
            "explanation": "<Why the correct answer is right, 2-3 sentences>",
            "xpReward": 30
          },
          {
            "difficulty": "medium",
            "question": "<More nuanced question>",
            "options": [...],
            "explanation": "<Detailed explanation>",
            "xpReward": 50
          },
          {
            "difficulty": "hard",
            "question": "<Edge case or deep-knowledge question>",
            "options": [...],
            "explanation": "<Thorough explanation including why wrong answers are wrong>",
            "xpReward": 80
          }
        ]
      }
    }
    // ... repeat for all 5 stages
  ],
  "skillTree": {
    "nodes": [
      // One node per stage concept, plus a final mastery node
      {
        "id": "skill-<slug>",
        "name": "<Skill Name>",
        "description": "<One sentence — what this skill represents>",
        "unlockedByStage": "stage-<slug>",
        "prerequisites": [],               // list skill IDs that must be unlocked first
        "xpCost": 0                        // 0 for first node, scales for later nodes
      }
      // ... 5-7 nodes total
    ]
  }
}

Requirements:
- `worldId` must be EXACTLY `[WORLD_ID]` — no modifications
- Stage IDs in `stageId` must match the world.json stage IDs exactly
- Every code example in `chunks` must be real, working code/commands for [TOPIC]
- Multiple choice questions must be unambiguous — exactly one correct answer
- `easy` questions test recall; `medium` questions test understanding; `hard` questions test application/edge cases
- The `storyIntro` for each stage should reference the world's lore and the boss from the corresponding world.json stage
- XP rewards should scale: stage 1 quest ~75 XP, stage 5 quest ~200 XP
- Do not include any explanatory text outside the JSON — output only the raw JSON object

Generate the knowledge.json now.
```

---

### Example Output (Abbreviated)

```json
{
  "$schema": "forgeMinds/knowledge/v1",
  "version": "1.0.0",
  "worldId": "world-linux-sysadmin",
  "topic": "Linux System Administration",
  "difficultyLevel": "beginner",
  "estimatedHours": 4,
  "stages": [
    {
      "stageId": "stage-filesystem",
      "storyIntro": "The Permission Wraith guards the File Catacombs...",
      "concept": {
        "title": "Linux Filesystem and Permissions",
        "chunks": [
          {
            "type": "code",
            "code": "ls -la /etc\nchmod 755 myfile.sh\nchown user:group myfile.sh",
            "language": "bash"
          }
        ]
      }
    }
  ]
}
```

> **Important:** The `worldId` field in knowledge.json must exactly match the `id` field in your world.json. A mismatch will cause the Campaign Loader validation to fail with a schema error.

---

### Validation Checklist

Before using this JSON in ForgeMinds, verify:

- [ ] `worldId` exactly matches the `id` in the corresponding `world.json`
- [ ] `stages` array has exactly 5 entries
- [ ] Each `stageId` matches a stage ID in the `world.json`
- [ ] Each stage has exactly 3 concept chunks
- [ ] Each challenge has exactly 3 variants (easy, medium, hard)
- [ ] Each variant has exactly 4 options with exactly 1 marked `"correct": true`
- [ ] All code in chunks is syntactically valid for the specified language
- [ ] `skillTree.nodes` forms a valid DAG (no circular prerequisites)
- [ ] No trailing commas, all strings quoted, all arrays/objects properly closed

---

## Combined Prompt (Generate Both at Once)

Use this prompt to generate both `world.json` and `knowledge.json` in a single AI call. The output will be a JSON object with two keys: `world` and `knowledge`. Split them into separate files before loading into ForgeMinds.

---

```
You are generating configuration files for ForgeMinds, a JSON-driven RPG learning game engine.

Generate BOTH a world.json AND a knowledge.json for a learning campaign with the following parameters:
- Topic: [TOPIC]  (e.g. "AWS IAM", "Git & GitHub", "SQL Fundamentals")
- Theme: [THEME]  (e.g. "haunted-library", "volcanic-forge", "arctic-research-station")
- Difficulty: [DIFFICULTY]  (beginner / intermediate / advanced)

Output a single JSON object with exactly two top-level keys: "world" and "knowledge".

The "world" value must follow the forgeMinds/world/v1 schema:
- $schema: "forgeMinds/world/v1"
- version: "1.0.0"
- id: "world-<topic-slug>"
- name: <Creative world name matching the theme>
- theme: <theme-slug>
- atmosphere: <atmosphere-slug>
- description: <2-3 sentence immersive description>
- lore: { worldOrigin, factionName, enemyFactionName, coreConflict }
- visualTheme: { primaryColor, accentColor, backgroundGradient, particleEffect, ambientSound, fontOverride }
- stages: [ exactly 5 stage objects, each with id, name, order, position, nodeIconKey, description, unlockCondition, atmosphereOverride, boss ]
  - boss fields: id, name, title, description, health, maxHealth, attackPattern, weaknesses, defeatCondition, rewardXp, rewardLoot, sprite
  - Stage positions: x from 100 to 900 (step ~200), y from 500 to 100 (step ~100)
  - Stage 1 unlockCondition: { "type": "always" }
  - Stages 2-5 unlockCondition: { "type": "stageComplete", "stageId": "<previous-stage-id>" }
- npcs: [ exactly 2 NPCs with roles "mentor" and "guide" ]
  - fields: id, name, role, title, description, avatar, dialogueStyle, unlockStage, hintUnlockThreshold, introDialogue, hintDialogues (array of 3)
- enemies: [ 2-3 common enemies ]
  - fields: id, name, description, health, maxHealth, attackType, xpReward, spawnStages, sprite
- completionReward: { title, description, xpBonus, badgeKey }

The "knowledge" value must follow the forgeMinds/knowledge/v1 schema:
- $schema: "forgeMinds/knowledge/v1"
- version: "1.0.0"
- worldId: MUST exactly equal the world's "id" field
- topic: [TOPIC]
- difficultyLevel: [DIFFICULTY]
- estimatedHours: <realistic number, 2-6>
- prerequisiteTopics: []
- tags: [ 4-6 relevant tags ]
- stages: [ exactly 5 stage objects with stageIds matching the world's stage IDs ]
  - Each stage: stageId, storyIntro, xpReward, bossObjective, concept, quest, challenge
  - concept: { title, summary, chunks: [ exactly 3 chunks — at least one must be type "code" with real working code ] }
  - quest: { id, title, objective, description, type, acceptanceCriteria (3+ items), hints (2 items), xpReward }
  - challenge: { id, type: "multiple-choice", title, variants: [ easy, medium, hard ] }
    - Each variant: difficulty, question, options (4 options, exactly 1 with "correct": true), explanation, xpReward
- skillTree: { nodes: [ 5-7 skill nodes forming a progression DAG ] }
  - Each node: id, name, description, unlockedByStage, prerequisites, xpCost

World quality requirements:
- Boss names must be creative, thematic personifications of real errors or challenges in [TOPIC]
- NPC personalities must be distinct and entertaining
- Enemy names should reference real failure modes in [TOPIC]

Knowledge quality requirements:
- All code examples must be real, working commands/code for [TOPIC]
- MCQ questions: easy = recall, medium = understanding, hard = application/edge case
- Each question must have exactly one unambiguously correct answer
- Explanations must teach, not just state the answer

Output format:
{
  "world": { /* complete world.json contents */ },
  "knowledge": { /* complete knowledge.json contents */ }
}

Do not include any text outside this JSON object. The output must be valid, parseable JSON.

Generate both files now.
```

---

### How to Use the Combined Output

1. Copy the full JSON response from the AI
2. Parse it as JSON (you can paste it into a JSON validator to confirm it's valid)
3. Extract the `world` value and save it as `world.json`
4. Extract the `knowledge` value and save it as `knowledge.json`
5. Open the ForgeMinds Campaign Loader, paste each file into its editor, and validate

Or, if you're comfortable with the command line:

```bash
# Save the AI output to a file
cat > combined.json << 'EOF'
<paste AI output here>
EOF

# Extract world.json
cat combined.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)['world'], indent=2))" > world.json

# Extract knowledge.json
cat combined.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)['knowledge'], indent=2))" > knowledge.json

# Verify both files are valid JSON
python3 -m json.tool world.json > /dev/null && echo "world.json OK"
python3 -m json.tool knowledge.json > /dev/null && echo "knowledge.json OK"
```

---

### Tips for Best Results

- **Be specific about your topic.** "Kubernetes" produces a broader campaign than "Kubernetes RBAC and Service Accounts" — specificity leads to more actionable content.
- **Choose a theme that contrasts with the topic.** A fantasy-medieval theme for a cloud-native topic creates interesting creative tension and memorable boss names.
- **Specify the audience.** Add context like "for a developer who already knows Python but has never used Docker" to get appropriately calibrated difficulty and explanations.
- **Iterate.** If the first output has weak code examples, ask the AI to "improve the code chunks in stages 2 and 4 with more realistic, complete examples".
- **Validate immediately.** Paste the output into the ForgeMinds Campaign Loader before making manual edits — the Zod validation error list will pinpoint any schema mismatches.
