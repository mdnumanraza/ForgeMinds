type EventMap = {
  stageSelected: { stageId: string }
  stagePhaseChanged: { stageId: string; phase: string }
  bossDefeated: { stageId: string }
  mapReady: void
  resize: { width: number; height: number }
}

type Handler<T> = (payload: T) => void

class EventBus {
  private listeners = new Map<string, Set<Handler<unknown>>>()

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    const set = this.listeners.get(event)!
    set.add(handler as Handler<unknown>)
    return () => set.delete(handler as Handler<unknown>)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((h) => h(payload as unknown))
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const eventBus = new EventBus()
