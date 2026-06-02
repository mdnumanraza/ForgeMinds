import type { Container } from 'pixi.js'
import { getPixiApp } from './PixiApp'

export interface Scene {
  container: Container
  onEnter?(): void
  onExit?(): void
  destroy(): void
}

const stack: Scene[] = []

export function pushScene(scene: Scene): void {
  const app = getPixiApp()
  if (!app) return
  const current = stack[stack.length - 1]
  if (current) current.onExit?.()
  stack.push(scene)
  app.stage.addChild(scene.container)
  scene.onEnter?.()
}

export function popScene(): void {
  const app = getPixiApp()
  if (!app || stack.length === 0) return
  const scene = stack.pop()!
  scene.onExit?.()
  app.stage.removeChild(scene.container)
  scene.destroy()
  const next = stack[stack.length - 1]
  if (next) next.onEnter?.()
}

export function replaceScene(scene: Scene): void {
  const app = getPixiApp()
  if (!app) return
  while (stack.length > 0) {
    const s = stack.pop()!
    s.onExit?.()
    app.stage.removeChild(s.container)
    s.destroy()
  }
  stack.push(scene)
  app.stage.addChild(scene.container)
  scene.onEnter?.()
}

export function clearScenes(): void {
  const app = getPixiApp()
  while (stack.length > 0) {
    const s = stack.pop()!
    s.onExit?.()
    if (app) app.stage.removeChild(s.container)
    s.destroy()
  }
}

export function currentScene(): Scene | null {
  return stack[stack.length - 1] ?? null
}
