# ForgeMinds — Example Campaigns & AI Prompt Templates

This directory contains reference material for the ForgeMinds JSON-driven RPG Learning Runtime Engine. It is organized into two types of content: **ready-to-use campaign JSON files** and **AI prompt templates** for generating your own.

---

## What's Here

| Path | Type | Description |
|------|------|-------------|
| `kubernetes-basics/world.json` | World Config | "The Kubernetes Citadel" — a sci-fi fortress themed around K8s fundamentals |
| `kubernetes-basics/knowledge.json` | Knowledge Config | 5-stage Kubernetes curriculum: Pods → Services → Deployments → ConfigMaps → Ingress |
| `docker-basics/world.json` | World Config | "The Container Forge" — a steampunk industrial foundry themed around Docker |
| `docker-basics/knowledge.json` | Knowledge Config | 5-stage Docker curriculum: Images → Containers → Volumes → Networks → Compose |
| `ai-prompt-template.md` | AI Prompt | Copy-pasteable prompts for generating your own world.json and knowledge.json via ChatGPT or Claude |

---

## How to Use

### Option A: Load a pre-built example in the app

1. Open ForgeMinds and click the **"+ New Campaign"** FAB (bottom-right)
2. In the Campaign Loader modal, click **"Load Template"**
3. Select a template from the dropdown (Kubernetes, Docker, etc.)
4. Both editors will be pre-filled with valid JSON
5. Click **"Validate & Launch"** to start playing

### Option B: Paste or upload JSON manually

1. Open the Campaign Loader modal
2. Copy the contents of a `world.json` and `knowledge.json` from this directory
3. Paste into the respective editors in the "Paste JSON" tab, or upload the files in the "Upload File" tab
4. Wait for validation to confirm both files are valid
5. Click **"Validate & Launch"**

### Option C: Generate your own with AI

1. Open the Campaign Loader modal and click **"Get Example Prompt"**
2. Select your topic and difficulty in the modal
3. Copy the generated prompt and paste it into ChatGPT or Claude
4. The AI will output a complete `world.json` and `knowledge.json`
5. Paste the outputs back into the Campaign Loader editors

Alternatively, see `ai-prompt-template.md` in this directory for the raw prompts.

---

## Schema Reference

Both JSON files must conform to the ForgeMinds schema:

- **World JSON schema:** `forgeMinds/world/v1`
  - Defines: world metadata, stages, NPCs, enemies, lore, atmosphere
  - Key required fields: `id`, `name`, `theme`, `stages[]`, `npcs[]`, `enemies[]`

- **Knowledge JSON schema:** `forgeMinds/knowledge/v1`
  - Defines: learning content, concept chunks, quests, challenges, XP rewards
  - Key required fields: `worldId`, `topic`, `stages[]`, `skillTree`
  - `worldId` must match the `id` field in the corresponding `world.json`

The engine validates both files against their Zod schemas at load time. Any validation errors are shown with field paths and plain-English messages in the Campaign Loader UI.

---

## Included Examples — Quick Reference

### Kubernetes Basics
- **World:** The Kubernetes Citadel (sci-fi / digital-fortress atmosphere)
- **Stages:** Pods, Services, Deployments, ConfigMaps, Ingress
- **Bosses:** The Pending Pod, The CrashLoop Specter, The Deployment Daemon, The ConfigMap Corruptor, The Ingress Interceptor
- **Difficulty:** Beginner
- **Estimated time:** ~4 hours

### Docker Basics
- **World:** The Container Forge (steampunk / industrial-foundry atmosphere)
- **Stages:** Images, Containers, Volumes, Networks, Compose
- **Bosses:** The Bloated Image, The Zombie Container, The Volume Phantom, The Network Wraith, The Compose Corruptor
- **Difficulty:** Beginner
- **Estimated time:** ~3 hours

---

## Adding New Examples

To add a new example campaign to this directory:

1. Create a subdirectory: `examples/<topic-slug>/`
2. Add `world.json` following the `forgeMinds/world/v1` schema
3. Add `knowledge.json` following the `forgeMinds/knowledge/v1` schema — ensure `worldId` matches the world's `id`
4. Update the table at the top of this README
5. To surface it as a starter template in the app, add an entry to `src/data/starterTemplates.ts`
