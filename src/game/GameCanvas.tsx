'use client'

import dynamic from 'next/dynamic'

// Must be a Client Component to use next/dynamic with ssr:false
const PhaserGame = dynamic(() => import('@/game/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ width: 800, height: 600 }}>
      <span className="text-gray-500 text-sm">Loading game engine...</span>
    </div>
  ),
})

export default function GameCanvas() {
  return <PhaserGame />
}
