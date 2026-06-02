# UI/UX Principles

> Design philosophy and interaction guidelines for ForgeMinds.

---

## Core Design Identity

ForgeMinds must feel like a **modern indie RPG**, not a learning app.

Design touchstones:
- Dark, immersive palette with gold/neon accents
- Cinematic typography (large, impactful headings)
- Purposeful animations (every interaction is rewarding)
- Game-first layout (content takes a backseat to the world)

---

## Design Token System

```css
/* Tailwind custom tokens in tailwind.config.ts */

colors:
  forge-void:    #0a0a0f    ← near-black background
  forge-dark:    #12121a    ← card/panel backgrounds
  forge-surface: #1a1a2e    ← elevated surfaces
  forge-border:  #2a2a4a    ← subtle borders
  forge-gold:    #f5c842    ← primary accent (XP, unlock, highlight)
  forge-ember:   #ff6b35    ← energy/action accent
  forge-frost:   #4fc3f7    ← information/hint accent
  forge-success: #4ade80    ← correct answer, completion
  forge-danger:  #f87171    ← wrong answer, health loss
  forge-text:    #e2e8f0    ← primary text
  forge-muted:   #64748b    ← secondary text

fonts:
  display: 'Cinzel'         ← headings, world names, boss names (Google Fonts)
  body:    'Inter'          ← UI text, descriptions
  mono:    'JetBrains Mono' ← code examples

shadows:
  glow-gold:    '0 0 20px rgba(245, 200, 66, 0.4)'
  glow-ember:   '0 0 20px rgba(255, 107, 53, 0.4)'
  glow-frost:   '0 0 20px rgba(79, 195, 247, 0.3)'
```

---

## Layout Principles

### Game View
- Full-screen canvas behind all game UI
- HUD overlaid as DOM elements (absolute positioned over canvas)
- No sidebars, no navigation bar during active stage
- Minimal chrome — the game is the UI

### Hub / World Select
- Card grid of worlds (3 columns on desktop, 1 on mobile)
- World cards: full bleed art, world name overlay, status badge
- Player stats (XP, level, streak) in a compact top bar

### Stage Flow
- Each phase (story, concept, quest, challenge) takes full viewport
- Transitions between phases: slide left (forward) / slide right (back)
- No tabs, no pagination — linear, focused flow

---

## Campaign Hub UX

The Campaign Hub is the player's home screen. It must feel like a **game lobby**, not a dashboard. When a player lands here, they should feel the pull of an unfinished adventure — not the dread of a task manager.

### Top Bar
- Player avatar (circular, with a subtle glow ring that pulses on new XP)
- XP bar: filled gold bar showing progress to next level, animated on load
- Level badge: bold number, styled as a game rank insignia
- Streak indicator: flame icon + count (e.g. "7-day streak"), glows when active today

### Hero Area — "Continue Campaign"
- Only shown when the player has an active (in-progress) campaign
- Large, full-width card with atmospheric background image matching the campaign's theme (e.g. the Kubernetes Citadel shows a blue-lit digital fortress)
- Overlaid content: campaign name (display-lg, Cinzel), current stage name, completion progress bar
- Primary CTA button: "Continue" (forge-gold, large)
- Secondary: "View Map" — opens campaign map overlay
- If no active campaign: hero area shows a welcome message and a "Start Your First Campaign" CTA pointing to the starter templates

### Section: "Your Campaigns"
- Card grid: 3 columns desktop, 2 columns tablet, 1 column mobile
- Each card shows:
  - Atmospheric thumbnail (generated from campaign theme)
  - Campaign name (heading weight, Cinzel)
  - Topic badge (e.g. "Kubernetes", "Docker")
  - Completion percentage (progress ring or bar)
  - Last played date (forge-muted, small)
- Card hover state: subtle scale up + gold border glow
- Card action buttons (visible on hover / always visible on mobile):
  - "Continue" (primary, gold)
  - "Replay" (secondary, ghost style)
  - "Delete" (danger, small text button — requires confirmation modal)
- Empty state: illustration + "No campaigns yet. Load a template to begin."

### Section: "Starter Templates"
- Horizontal scroll row (snap scrolling on mobile)
- Section heading: "Starter Templates" with a "Browse All" link
- Template card (compact, fixed height):
  - Topic icon/emoji + topic name (Cinzel)
  - Difficulty badge: colored pill (green = Beginner, amber = Intermediate, red = Advanced)
  - Estimated hours (e.g. "~4 hours")
  - "Load Template" button — immediately loads that template into the Campaign Loader modal with both JSONs pre-filled
- 5 included templates: Kubernetes, Docker, Linux, Networking, DevOps

### Floating Action Button (FAB)
- Fixed position: bottom-right corner, always visible
- Label: "+ New Campaign"
- Style: forge-gold background, bold text, subtle pulsing shadow
- Action: opens the Campaign Loader Modal
- On mobile: expands to a labeled FAB (icon + text)

---

## Campaign Loader Modal UX

Triggered when the player clicks "+ New Campaign" or "Load Template". This is the bridge between a user's JSON configs and a live campaign.

### Layout
- Mobile: modal slides up from the bottom, full-screen
- Desktop: centered large modal (max-width 900px), slides in from slightly below center
- Background: dark overlay with blur on content behind
- Header: "Load Campaign" title + close (X) button

### Tabs
Two tabs across the top of the modal content area:
- **"Paste JSON"** (default)
- **"Upload File"**

Tab style: underline indicator, not pill/box — keeps the modal feeling clean.

---

### Tab: Paste JSON

Two code editors arranged side-by-side on desktop, stacked (World JSON on top) on mobile.

**Code Editors:**
- Label above each: "World JSON" | "Knowledge JSON"
- Syntax highlighting via CodeMirror 6 (lightweight, tree-shakeable) or Monaco Editor lite
- Dark theme matching forge palette
- Line numbers shown
- Auto-detect JSON and highlight keys, strings, numbers, booleans distinctly
- Each editor: min-height 240px, max-height 400px (scrollable), resizable via drag handle

**Validation Status (below each editor):**
- Shown immediately on any change (debounced 400ms)
- Three states:
  - Validating: spinning badge (forge-frost color), text "Validating..."
  - Valid: green checkmark badge (forge-success), text "Valid [World/Knowledge] Config"
  - Invalid: red X badge (forge-danger), error summary

**Inline Error List (only on invalid state):**
- Accordion / expandable list beneath the validation badge
- Each error item:
  - Field path in monospace: e.g. `stages[0].boss.health`
  - Human-readable message: e.g. "Must be a number between 50 and 1000"
  - Clicking the error jumps the editor scroll position to the relevant line and places a red gutter marker
- If the JSON is syntactically broken (not parseable): show "Invalid JSON — check syntax" with character position hint (e.g. "Unexpected token at line 14, col 3")

**Action Buttons (below editors):**
- "Get Example Prompt" — forge-gold background, bold, prominent. Opens the Example Prompt Modal. Tooltip: "Generate your own JSON with AI"
- "Load Template" — dropdown button (ghost style). Shows a list of 5 starter templates. Selecting one fills both editors instantly with valid template JSON.
- "Validate & Launch" — primary CTA, disabled (greyed) until both editors show valid status. When clicked: closes modal and launches the campaign at Stage 1.

---

### Tab: Upload File

Two drag-and-drop zones, side-by-side on desktop, stacked on mobile.

**Drop Zone design:**
- Dashed border (forge-border), rounded corners
- Icon: cloud-upload icon + label ("Drop world.json here" / "Drop knowledge.json here")
- Subtext: "or click to browse"
- Drag-over state: border turns forge-gold, background slightly lighter
- After successful upload: zone collapses into a compact "file accepted" banner with filename + remove button

**After upload:**
- Same validation pipeline as Paste JSON tab fires immediately
- Below the drop zone: JSON preview panel (read-only code view, collapsible)
- Validation badge + error list same as Paste JSON tab

**"Validate & Launch" button:** same behavior as Paste JSON tab — disabled until both files are valid.

---

## Example Prompt Modal UX

Opened from the "Get Example Prompt" button in the Campaign Loader. This modal helps users who want to generate their own JSON configs using an AI assistant.

### Layout
- Full-screen overlay (z-index above Campaign Loader)
- Dark background, scroll if content overflows
- Header: "Generate Your World with AI" (display-lg, Cinzel)
- Subtitle: "Copy this prompt and paste it into ChatGPT or Claude" (body, forge-muted)
- Close button (X) top-right

### Selectors (top of modal, horizontal row)
- **Topic dropdown:** Kubernetes / Docker / Linux / Networking / DevOps / Custom...
  - Selecting "Custom..." reveals a free-text input: "Describe your topic"
  - Default: Kubernetes
- **Difficulty selector:** segmented control (3 options): Beginner / Intermediate / Advanced
  - Default: Beginner

### Generated Prompt Area
- Large read-only `<textarea>` (monospace, dark background, light text)
- Minimum height: 320px
- Auto-updates when topic or difficulty changes (instant — no submit button needed)
- The prompt is dynamically assembled from the selected topic/difficulty and the baked-in schema template
- Subtle "Updated" flash animation when the prompt content changes

### Copy Button
- Positioned above or overlaid on the top-right corner of the prompt textarea
- Label: "Copy Prompt"
- Style: forge-gold, medium size
- On click: copies full prompt text to clipboard, label changes to "Copied!" with a checkmark for 2 seconds, then reverts

### Pre-built Examples Link
- Below the prompt textarea
- Text: "Or load a pre-built example instead"
- Shows 5 template buttons in a horizontal row (compact, ghost style): Kubernetes / Docker / Linux / Networking / DevOps
- Clicking one closes the Example Prompt Modal, returns to Campaign Loader, and fills both editors with the selected template

---

## JSON Validation UX

Validation is a first-class experience — users are building structured configs and need clear, actionable feedback at every step.

### Validation States

**Valid JSON and valid schema:**
- Green checkmark badge (forge-success background)
- Text: "Valid World Config" or "Valid Knowledge Config"
- Badge animates in with a subtle scale pop

**Invalid JSON (syntax error — cannot parse):**
- Red X badge (forge-danger background)
- Text: "Invalid JSON — check syntax"
- Below badge: character-level hint in monospace, e.g. `Line 14, col 3 — Unexpected token '}'`
- The code editor highlights the error line with a red gutter marker

**Invalid schema (JSON parses, but Zod validation fails):**
- Red X badge (forge-danger background)
- Text: "Schema Errors Found (N issues)"
- Below badge: accordion error list, each item shows:
  - **Field path** in `monospace` (e.g. `stages[2].quest.xpReward`)
  - **Human-readable message** (e.g. "Required field is missing" or "Must be a positive integer")
  - Chevron icon — clicking the item scrolls the code editor to the relevant line and places an inline red underline at that position
- Error list is scrollable if there are many errors

**Validating (in-progress):**
- Spinning ring badge (forge-frost border, dark fill)
- Text: "Validating..."
- Debounce: validation fires 400ms after the user stops typing — no badge flicker on every keystroke

### General Principles
- Never show a bare "Error" or "Invalid" with no path or explanation
- Always give the user the field path + a plain-English explanation of what's wrong
- Make errors clickable — they should navigate to the source of the problem
- On mobile: error list collapses behind a "Show N errors" toggle to save space
- When both JSONs are valid: the "Validate & Launch" button animates to an active state (gold glow pulse) to draw attention

---

## Typography Scale

```
display-xl:  4rem  Cinzel   700   ← landing hero, world names
display-lg:  2.5rem Cinzel  600   ← stage names, boss names
heading:     1.5rem Inter   600   ← section headings
body:        1rem   Inter   400   ← content text
small:       0.875rem Inter  400  ← metadata, labels
code:        0.9rem JetBrains Mono 400 ← code examples
```

---

## Component Patterns

### Game Button
- Base: dark fill with forge-gold border glow on hover
- Active: scale 0.96 (pressed feel)
- Disabled: opacity 0.4, no hover effects

### Quest Panel
- Slides up from bottom
- Semi-transparent dark background (backdrop blur)
- Clear hierarchy: objective → description → input area → submit

### Challenge Modal
- Centered overlay (not full-screen)
- Question text large + bold
- Options as tappable cards (not radio buttons)
- Selected option: gold border highlight
- After submit: options lock and show correct/wrong state

### Dialog Box
- RPG-style text box at bottom of viewport
- Avatar portrait on left
- Text appears character-by-character (typewriter effect)
- "Tap to continue" indicator

### XP Bar
- Persistent in header/HUD during stage
- Gold fill, animated on XP gain
- Level number beside the bar, bold
- Subtle particle sparkle on level up

---

## DO and DON'T

**DO:**
- Use large, bold typography for important information
- Show progress at every step (XP, stage count, streak)
- Make buttons feel physically pressable (scale transform)
- Use sound + animation together for key moments
- Give every action an immediate visual response

**DON'T:**
- Show navigation menus during active game stages
- Use enterprise-style tables or lists for game data
- Use blue-on-white color schemes
- Use loading spinners without context ("Loading world...")
- Use flat, generic button styles

---

## Responsive Design

- Mobile-first CSS (Tailwind's `sm:`, `md:`, `lg:` prefixes)
- PixiJS canvas: resize to container, respect device pixel ratio
- Stage flow: single column on mobile, may expand to two columns on desktop for concept phase
- Touch targets: minimum 44×44px for all interactive elements
