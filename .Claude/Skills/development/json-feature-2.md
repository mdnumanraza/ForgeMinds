IMPORTANT: Re-evaluate and update the entire planning documentation based on the following product direction changes.

This is NOT a small feature addition.

This changes the core product architecture and content flow.

Update ALL relevant planning, architecture, roadmap, engine design, and implementation documents accordingly.

---

# UPDATED CORE PRODUCT DIRECTION

The application is NOT an AI-first platform in this stage.

The application is a JSON-driven adaptive RPG learning engine.

The engine dynamically creates playable learning worlds using structured configuration files provided by users.

AI integration is NOT required for initial implementation.

The system should remain:
- deterministic
- modular
- maintainable
- highly scalable
- content-driven

Future AI support should only be architected for compatibility, not implemented now.

---

# UPDATED PRODUCT FLOW

User flow should now be:

1. User logs in
2. User sees:
   - recently played worlds
   - saved campaigns
   - continue progression
   - create new world button

3. When clicking "Create New World":
   user provides:

   A. World JSON
   B. Knowledge JSON

4. Engine validates JSONs
5. Engine dynamically generates:
   - world map
   - stages
   - quests
   - enemies
   - bosses
   - progression systems
   - gameplay flow
   - rewards
   - dialogs
   - unlock systems

Everything should be generated dynamically from configuration.

Avoid hardcoded worlds or topic systems.

---

# IMPORTANT ARCHITECTURE CHANGE

The platform should now be designed as:

- RPG Learning Runtime Engine
- Campaign Loader System
- Modular Content Engine
- Dynamic World Renderer

NOT:
- static course platform
- fixed game
- AI-generated-only system

---

# CONTENT SYSTEM REQUIREMENTS

The engine must support 2 independent configuration systems:

## 1. World JSON

Controls:
- biome
- atmosphere
- terrain
- visual theme
- NPCs
- enemies
- lore
- story flow
- stage visuals
- boss identity
- progression map

## 2. Knowledge JSON

Controls:
- topics
- subtopics
- stages
- lessons
- quests
- MCQs
- practical tasks
- boss objectives
- XP rewards
- unlock conditions
- progression chains

The engine combines both systems dynamically.

Update all architecture docs to reflect this separation clearly.

---

# IMPORTANT UX REQUIREMENT

Users should NOT manually write JSON from scratch.

The app should provide:

- example JSON templates
- starter templates
- sample campaigns
- example prompts users can copy into AI tools

Add support for:
"Get Example Prompt" functionality.

This should provide:
- example world JSON
- example knowledge JSON
- example AI prompt users can paste into ChatGPT/Claude

Update planning docs accordingly.

---

# REQUIRED DOCUMENTATION CHANGES

Update all relevant documents including:

- architecture.md
- game-engine-design.md
- content-system.md
- ui-ux-principles.md
- roadmap docs
- phase implementation docs
- folder structure docs
- api design docs
- database design docs

Add sections for:

- content ingestion pipeline
- schema validation
- runtime world generation
- dynamic campaign loading
- modular stage rendering
- save/load progression
- content versioning
- JSON schema evolution
- campaign persistence
- example template system

---

# IMPORTANT ENGINE PRINCIPLE

The engine should function similarly to:

- moddable game engines
- campaign-based RPG systems
- configurable runtime systems

Content should drive gameplay.

NOT hardcoded logic.

---

# REQUIRED ADDITION

Create `/development/examples` directory containing:

- example world JSONs
- example knowledge JSONs
- example prompts
- schema explanations
- starter templates

Examples should include:
- Kubernetes
- Docker
- Linux
- Networking
- DevOps

---

# IMPORTANT IMPLEMENTATION PRIORITY

Prioritize:
- modularity
- schema-driven systems
- scalable content architecture
- polished gameplay loop
- dynamic rendering systems

Avoid:
- premature AI orchestration
- overengineering
- unnecessary complexity

Re-architect the planning professionally based on this updated direction.