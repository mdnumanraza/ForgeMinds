import type { Campaign } from './types'
import { loadCampaignFromObjects } from './CampaignLoader'

export interface TemplateEntry {
  id: string
  name: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  stageCount: number
  description: string
  worldJson: object
  knowledgeJson: object
}

// Lazy-loaded template registry — imported statically so they're bundled
const TEMPLATE_MAP: Record<string, () => Promise<{ world: object; knowledge: object }>> = {
  'javascript-basics': () =>
    import('@/content/templates/javascript-basics').then((m) => ({
      world: m.javascriptBasicsWorld,
      knowledge: m.javascriptBasicsKnowledge,
    })),
  'kubernetes-basics': () =>
    import('@/content/templates/kubernetes-basics').then((m) => ({
      world: m.kubernetesBasicsWorld,
      knowledge: m.kubernetesBasicsKnowledge,
    })),
}

export const TEMPLATE_METADATA: Omit<TemplateEntry, 'worldJson' | 'knowledgeJson'>[] = [
  {
    id: 'javascript-basics',
    name: 'The JavaScript Realm',
    topic: 'JavaScript Fundamentals',
    difficulty: 'beginner',
    estimatedHours: 2,
    stageCount: 3,
    description: 'Master variables, functions, and arrays in an RPG cyberpunk world.',
  },
  {
    id: 'kubernetes-basics',
    name: 'The Kubernetes Citadel',
    topic: 'Kubernetes Fundamentals',
    difficulty: 'intermediate',
    estimatedHours: 3,
    stageCount: 3,
    description: 'Learn Pods, Deployments, and Services by restoring a broken cluster.',
  },
]

export async function loadTemplate(templateId: string): Promise<Campaign | null> {
  const loader = TEMPLATE_MAP[templateId]
  if (!loader) return null
  const { world, knowledge } = await loader()
  const result = loadCampaignFromObjects(world, knowledge)
  if (!result.ok) {
    console.error(`[TemplateRegistry] Template "${templateId}" failed validation:`, result.validation.errors)
    return null
  }
  return result.campaign
}
