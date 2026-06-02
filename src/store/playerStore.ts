import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000]

function computeLevel(xp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

interface PlayerState {
  xp: number
  level: number
  avatarKey: string
  username: string
  addXP: (amount: number) => { levelUp: boolean; newLevel: number }
  setAvatar: (key: string) => void
  setUsername: (name: string) => void
  reset: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      avatarKey: 'hero-1',
      username: 'Adventurer',

      addXP: (amount) => {
        const current = get()
        const newXP = current.xp + amount
        const newLevel = computeLevel(newXP)
        const levelUp = newLevel > current.level
        set({ xp: newXP, level: newLevel })
        return { levelUp, newLevel }
      },

      setAvatar: (key) => set({ avatarKey: key }),
      setUsername: (name) => set({ username: name }),
      reset: () => set({ xp: 0, level: 1, avatarKey: 'hero-1', username: 'Adventurer' }),
    }),
    { name: 'fm:player' }
  )
)

export { LEVEL_THRESHOLDS, computeLevel }
