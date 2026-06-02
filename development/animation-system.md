# Animation System

> Design for all motion, transitions, and visual feedback in ForgeMinds.

---

## Philosophy

Every interaction must feel rewarding. Animation is not decoration — it's feedback.  
Keep animations fast (< 400ms for responses), satisfying (spring physics over linear), and purposeful (no gratuitous motion).

---

## Animation Layers

| Layer | Tool | Responsibility |
|---|---|---|
| UI transitions | Framer Motion | page enters/exits, panel slides, modal appears |
| Micro-interactions | Framer Motion | button presses, hover states, correct/wrong feedback |
| Progression animations | Framer Motion | XP bar fill, level up, stage unlock badge |
| Game world | PixiJS tweens | node unlock on world map, boss entry, sprite movement |
| Loading states | CSS / Tailwind | skeleton screens, spinner |

---

## Framer Motion Patterns

### Page Transitions

```typescript
// Shared across all game route pages
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.2 } }
}

// In page component:
<motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
```

### Dialog Box (slide up)
```typescript
export const dialogVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit:    { opacity: 0, y: 20, transition: { duration: 0.15 } }
}
```

### XP Bar Fill
```typescript
// Animated width using layout animation
<motion.div
  className="h-full bg-forge-gold rounded-full"
  initial={{ width: `${previousPercent}%` }}
  animate={{ width: `${newPercent}%` }}
  transition={{ duration: 0.8, ease: 'easeOut' }}
/>
```

### Floating XP Number
```typescript
export const floatingXPVariants = {
  initial: { opacity: 0, y: 0, scale: 0.8 },
  animate: { opacity: [0, 1, 1, 0], y: -60, scale: [0.8, 1.2, 1], transition: { duration: 1.2 } }
}
```

### Level Up Overlay
- Full-screen dark overlay fades in (opacity 0 → 0.9)
- Level number scale: 0 → 1.5 → 1.0 (spring bounce)
- Title text: character-by-character reveal using `stagger`
- Overlay fades out after 2.5s

---

## PixiJS Animation Patterns

PixiJS animations use either:
1. **`@pixi/animate` tween** — for sprite movement and scale
2. **Ticker delta** — for continuous animations (idle sprite bob, particle effects)

### Stage Node Unlock
```typescript
async function playUnlockAnimation(node: StageNodeSprite) {
  // 1. gold glow pulse (filter brightness tween)
  // 2. scale bounce: 1.0 → 1.3 → 1.0
  // 3. icon swap: locked → available
  // 4. connecting path line draws from this node to next
}
```

### Boss Entry
```typescript
async function playBossEntry(boss: BossSprite) {
  // 1. screen flash (white overlay, alpha 0 → 1 → 0, 200ms)
  // 2. boss slides in from bottom (y tween)
  // 3. camera shake (container x offset oscillates, dampens)
  // 4. boss name text appears with dramatic fade
}
```

---

## Game-Specific Animations

| Event | Animation |
|---|---|
| Correct answer | Dialog border flashes green, ✓ icon scales in |
| Wrong answer | Panel shakes (horizontal oscillate, dampen) |
| Hint appears | Text types out character by character |
| Quest complete | Checkmark draws itself (SVG path animation) |
| Boss fight start | Screen flash + boss slides in from below |
| Stage complete | Stage node glows gold + connectors draw to next node |
| World complete | Confetti burst (PixiJS particles) + banner unfurls |

---

## Performance Rules

- No layout animations that trigger reflow in tight loops
- PixiJS animations run on canvas, zero DOM impact
- Framer Motion `layoutId` used only for shared element transitions (not lists)
- Disable animations via `prefers-reduced-motion` media query:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const duration = prefersReducedMotion ? 0 : 0.3
```

---

## Sound Design (Phase 2+)

- Howler.js for audio (small, Web Audio API wrapper)
- Sound events fire in parallel with animations
- Always mutable: global mute toggle in player settings
- Phase 1: no audio required
