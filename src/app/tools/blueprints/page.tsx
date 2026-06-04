import { BlueprintViewer } from '@/blueprint/BlueprintViewer'
import { KUBERNETES_KINGDOM } from '@/blueprint/data/mock-campaign'

export default function BlueprintsPage() {
  return <BlueprintViewer campaign={KUBERNETES_KINGDOM} />
}
