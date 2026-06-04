'use client'
import type { Beat } from '../data/types'
import { BEAT_COLOURS, BEAT_LABELS } from '../data/adapter'

interface Props {
  beat: Beat
  onClose: () => void
}

export function BeatDetailPanel({ beat, onClose }: Props) {
  const colourClass = BEAT_COLOURS[beat.type] ?? 'bg-gray-500'
  const label = BEAT_LABELS[beat.type] ?? beat.type
  const p = beat.payload

  return (
    <aside className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto z-10 flex flex-col">
      {/* Header */}
      <div className={`${colourClass} px-4 py-3 flex items-center justify-between`}>
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-white font-semibold mt-0.5">{p.title}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-xl leading-none ml-2"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-4 text-sm">
        <Row label="Beat Type" value={beat.type} mono />
        <Row label="Position" value={String(beat.position)} mono />

        {p.conceptRef && <Row label="Concept" value={p.conceptRef} mono />}
        {p.learningGoal && <Row label="Learning Goal" value={p.learningGoal} />}
        {p.description && <Row label="Description" value={p.description} />}

        {p.relatedNPCs && p.relatedNPCs.length > 0 && (
          <ListRow label="Related NPCs" items={p.relatedNPCs} colour="text-teal-400" />
        )}
        {p.relatedQuests && p.relatedQuests.length > 0 && (
          <ListRow label="Related Quests" items={p.relatedQuests} colour="text-violet-400" />
        )}
        {p.relatedEnemies && p.relatedEnemies.length > 0 && (
          <ListRow label="Related Enemies" items={p.relatedEnemies} colour="text-red-400" />
        )}
        {p.conceptsRequired && p.conceptsRequired.length > 0 && (
          <ListRow label="Concepts Required" items={p.conceptsRequired} colour="text-blue-400" />
        )}
      </div>
    </aside>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-gray-200 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}

function ListRow({ label, items, colour }: { label: string; items: string[]; colour: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className={`${colour} text-xs`}>— {item}</li>
        ))}
      </ul>
    </div>
  )
}
