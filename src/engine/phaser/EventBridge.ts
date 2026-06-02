type Listener<T> = (payload: T) => void

export type PhaserEvents = {
  npcInteract: { npcId: string; lines: string[]; name: string }
  battleStart: { enemyId: string; challengeId: string; enemyName: string }
  battleWon: { enemyId: string; xpReward: number; coinReward: number }
  battleFled: { enemyId: string }
  discoveryFound: { discoveryId: string; xpReward: number; coinReward: number; title: string }
  bossIntroReady: { stageId: string; bossName: string; introText: string }
  bossResult: { stageId: string; score: number; passed: boolean; redirectHints: string[] }
  zoneTransition: { toZoneId: string }
  mapReady: void
}

class EventBridge<Events extends Record<string, unknown>> {
  private listeners: Partial<{ [K in keyof Events]: Listener<Events[K]>[] }> = {}

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(listener)
    return () => this.off(event, listener)
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const arr = this.listeners[event]
    if (!arr) return
    const idx = arr.indexOf(listener)
    if (idx !== -1) arr.splice(idx, 1)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const arr = this.listeners[event]
    if (!arr) return
    for (const listener of [...arr]) {
      listener(payload)
    }
  }

  clear(): void {
    this.listeners = {}
  }
}

export const phaserBridge = new EventBridge<PhaserEvents>()
