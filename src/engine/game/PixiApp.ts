import { Application } from 'pixi.js'

let app: Application | null = null
let initPromise: Promise<Application> | null = null

export async function initPixiApp(canvas: HTMLCanvasElement): Promise<Application> {
  if (app) return app
  if (initPromise) return initPromise

  initPromise = (async () => {
    const instance = new Application()
    await instance.init({
      canvas,
      width: canvas.clientWidth || 800,
      height: canvas.clientHeight || 600,
      backgroundColor: 0x0a0a0f,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
    app = instance
    initPromise = null
    return app
  })()

  return initPromise
}

export function getPixiApp(): Application | null {
  return app
}

export function resizePixiApp(width: number, height: number): void {
  if (!app) return
  app.renderer.resize(width, height)
}

export function destroyPixiApp(): void {
  if (!app) return
  app.destroy(false, { children: true, texture: true })
  app = null
  initPromise = null
}
