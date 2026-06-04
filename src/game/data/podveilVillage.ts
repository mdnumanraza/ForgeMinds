import type { StageData } from './StageData'

// Podveil Village — Stage 2 prototype
// All measurements in pixels. World is 1600×1200 — smaller than the debug
// world but large enough for the village to breathe.

export const podveilVillage: StageData = {
  id: 'stage-02-podveil-village',
  name: 'Podveil Village',
  width: 1600,
  height: 1200,
  backgroundColour: '#1e2d1e', // dark green — grass

  // Player starts near the southern entry path
  spawnPoint: { x: 800, y: 1050 },

  obstacles: [
    // ── Perimeter fences / world edge markers ──────────────────────────────
    // North wall
    { x: 0,    y: 0,    width: 1600, height: 16,  colour: 0x5a3e28, label: 'north-wall' },
    // South wall
    { x: 0,    y: 1184, width: 1600, height: 16,  colour: 0x5a3e28, label: 'south-wall' },
    // West wall
    { x: 0,    y: 0,    width: 16,   height: 1200, colour: 0x5a3e28, label: 'west-wall' },
    // East wall
    { x: 1584, y: 0,    width: 16,   height: 1200, colour: 0x5a3e28, label: 'east-wall' },

    // ── Buildings (grey-blue rectangles) ───────────────────────────────────
    // Mira's home — south-west quarter, the Pod structure
    { x: 160,  y: 700,  width: 180,  height: 140, colour: 0x4a5a6a, label: "mira-home" },
    // Sera's house (village keeper) — central-north
    { x: 680,  y: 180,  width: 200,  height: 150, colour: 0x4a5a6a, label: 'sera-house' },
    // Old Dorn's workshop — east side
    { x: 1180, y: 380,  width: 160,  height: 120, colour: 0x5a4a3a, label: 'dorn-workshop' },
    // Northern house (burnt, darker)
    { x: 300,  y: 140,  width: 140,  height: 110, colour: 0x3a3a3a, label: 'burnt-house' },
    // East house
    { x: 1100, y: 600,  width: 150,  height: 130, colour: 0x4a5a6a, label: 'east-house' },
    // Small shed — south-east
    { x: 1280, y: 900,  width: 90,   height: 70,  colour: 0x5a4a3a, label: 'shed' },

    // ── Fences (thin brown strips) ──────────────────────────────────────────
    // Mira's yard fence (north)
    { x: 130,  y: 660,  width: 240,  height: 10,  colour: 0x7a5a38 },
    // Mira's yard fence (west)
    { x: 130,  y: 660,  width: 10,   height: 210, colour: 0x7a5a38 },
    // Mira's yard fence (east)
    { x: 360,  y: 660,  width: 10,   height: 210, colour: 0x7a5a38 },
    // Central garden fence
    { x: 620,  y: 480,  width: 200,  height: 10,  colour: 0x7a5a38 },
    { x: 620,  y: 480,  width: 10,   height: 100, colour: 0x7a5a38 },
    { x: 820,  y: 480,  width: 10,   height: 100, colour: 0x7a5a38 },
    // North-east fence line
    { x: 900,  y: 200,  width: 260,  height: 10,  colour: 0x7a5a38 },

    // ── Trees (dark green circles approximated as squares) ─────────────────
    { x: 60,   y: 60,   width: 48,   height: 48,  colour: 0x2d5a2d, label: 'tree' },
    { x: 140,  y: 55,   width: 44,   height: 44,  colour: 0x336633, label: 'tree' },
    { x: 1480, y: 80,   width: 52,   height: 52,  colour: 0x2d5a2d, label: 'tree' },
    { x: 1540, y: 60,   width: 40,   height: 40,  colour: 0x336633, label: 'tree' },
    { x: 50,   y: 500,  width: 46,   height: 46,  colour: 0x2d5a2d, label: 'tree' },
    { x: 50,   y: 580,  width: 42,   height: 42,  colour: 0x336633, label: 'tree' },
    { x: 1500, y: 700,  width: 50,   height: 50,  colour: 0x2d5a2d, label: 'tree' },
    { x: 480,  y: 900,  width: 46,   height: 46,  colour: 0x336633, label: 'tree' },
    { x: 900,  y: 850,  width: 48,   height: 48,  colour: 0x2d5a2d, label: 'tree' },
    { x: 960,  y: 830,  width: 40,   height: 40,  colour: 0x336633, label: 'tree' },
    { x: 700,  y: 1000, width: 44,   height: 44,  colour: 0x2d5a2d, label: 'tree' },

    // ── Rocks (grey irregular shapes approximated as small rects) ──────────
    { x: 540,  y: 720,  width: 32,   height: 22,  colour: 0x666666, label: 'rock' },
    { x: 555,  y: 730,  width: 24,   height: 16,  colour: 0x888888, label: 'rock' },
    { x: 1050, y: 300,  width: 28,   height: 20,  colour: 0x666666, label: 'rock' },
    { x: 1060, y: 310,  width: 20,   height: 14,  colour: 0x888888, label: 'rock' },
    { x: 240,  y: 920,  width: 30,   height: 22,  colour: 0x666666, label: 'rock' },
    { x: 1380, y: 500,  width: 26,   height: 18,  colour: 0x666666, label: 'rock' },
  ],
}
