import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { Scene } from '../SceneManager'
import type { Campaign } from '../../content/types'
import { eventBus } from '../EventBus'
import { resolveBackground } from '../AssetRegistry'

interface StageNodeView {
  stageId: string
  x: number
  y: number
  status: 'locked' | 'available' | 'completed'
}

export class WorldMapScene implements Scene {
  container: Container
  private campaign: Campaign
  private getStageStatus: (stageId: string) => 'locked' | 'available' | 'completed'

  constructor(
    campaign: Campaign,
    getStageStatus: (stageId: string) => 'locked' | 'available' | 'completed'
  ) {
    this.campaign = campaign
    this.getStageStatus = getStageStatus
    this.container = new Container()
    this.build()
  }

  private build(): void {
    const stages = this.campaign.world.stages
    const mapCfg = this.campaign.world.map

    // Background tint
    const bg = new Graphics()
    bg.rect(0, 0, mapCfg.width, mapCfg.height)
    bg.fill({ color: 0x12121a })
    this.container.addChild(bg)

    // Draw connection lines first (behind nodes)
    for (const stage of stages) {
      const cond = stage.unlockCondition
      if (cond.type === 'stage_complete') {
        const parent = stages.find((s) => s.id === cond.stageId)
        if (parent) {
          this.drawConnection(parent.position.x, parent.position.y, stage.position.x, stage.position.y)
        }
      }
    }

    // Draw stage nodes
    const nodes: StageNodeView[] = stages.map((s) => ({
      stageId: s.id,
      x: s.position.x,
      y: s.position.y,
      status: this.getStageStatus(s.id),
    }))

    for (const node of nodes) {
      this.drawStageNode(node, stages.find((s) => s.id === node.stageId)?.name ?? node.stageId)
    }

    eventBus.emit('mapReady', undefined as unknown as void)
  }

  private drawConnection(x1: number, y1: number, x2: number, y2: number): void {
    const line = new Graphics()
    line.moveTo(x1, y1)
    line.lineTo(x2, y2)
    line.stroke({ color: 0x2a2a4a, width: 2 })
    this.container.addChild(line)
  }

  private drawStageNode(node: StageNodeView, label: string): void {
    const g = new Graphics()
    const color =
      node.status === 'completed' ? 0x4ade80 :
      node.status === 'available' ? 0xf5c842 :
      0x2a2a4a

    g.circle(node.x, node.y, 24)
    g.fill({ color })

    if (node.status !== 'locked') {
      g.circle(node.x, node.y, 24)
      g.stroke({ color: node.status === 'completed' ? 0x86efac : 0xfde68a, width: 2 })

      g.eventMode = 'static'
      g.cursor = 'pointer'
      g.on('pointerdown', () => {
        eventBus.emit('stageSelected', { stageId: node.stageId })
      })
    }

    const text = new Text({
      text: label.slice(0, 12),
      style: new TextStyle({
        fontSize: 10,
        fill: node.status === 'locked' ? 0x64748b : 0xe2e8f0,
        fontFamily: 'Inter, sans-serif',
        align: 'center',
      }),
    })
    text.anchor.set(0.5)
    text.x = node.x
    text.y = node.y + 34

    this.container.addChild(g, text)
  }

  rebuild(getStageStatus: (stageId: string) => 'locked' | 'available' | 'completed'): void {
    this.getStageStatus = getStageStatus
    this.container.removeChildren()
    this.build()
  }

  onEnter(): void {}
  onExit(): void {}

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
